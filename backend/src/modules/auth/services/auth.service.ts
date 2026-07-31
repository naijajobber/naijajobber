import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { MailService } from '../../../infrastructure/mail/mail.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UsersService } from '../../users/services/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const verificationToken = this.generateToken();
    const role = dto.role ?? Role.JOB_SEEKER;

    const user = await this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      password: hashed,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    await this.usersService.ensureReferralCode(user._id.toString());

    return {
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before login');
    }

    await this.usersRepository.updateById(user._id.toString(), {
      lastLoginAt: new Date(),
    });

    const tokens = await this.issueTokens(user);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<{ message: string }> {
    await this.usersRepository.updateById(userId, { refreshTokenHash: null });
    if (refreshToken) {
      const key = this.refreshBlacklistKey(refreshToken);
      await this.redis.set(key, '1', 7 * 24 * 60 * 60);
    }
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    const blacklisted = await this.redis.get(
      this.refreshBlacklistKey(refreshToken),
    );
    if (blacklisted) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersRepository.findByVerificationToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersRepository.updateById(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    // Always return success to avoid email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const token = this.generateToken();
    await this.usersRepository.updateById(user._id.toString(), {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    });
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findByPasswordResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.usersRepository.updateById(user._id.toString(), {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokenHash: null,
    });

    return { message: 'Password reset successful' };
  }

  async loginWithGoogle(input: {
    code?: string;
    mockEmail?: string;
  }) {
    const clientId = this.config.get<string>('oauth.googleClientId') || '';
    const clientSecret = this.config.get<string>('oauth.googleClientSecret') || '';

    // Local mock when Google secrets are absent
    if (!clientId || !clientSecret) {
      const email = (
        input.mockEmail ||
        `google_user_${Date.now()}@gmail.com`
      ).toLowerCase();
      let user = await this.usersRepository.findByEmail(email);
      if (!user) {
        const hashed = await bcrypt.hash(randomBytes(16).toString('hex'), 12);
        user = await this.usersRepository.create({
          firstName: 'Google',
          lastName: 'User',
          email,
          password: hashed,
          role: Role.JOB_SEEKER,
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        });
        await this.usersRepository.updateById(user._id.toString(), {
          oauthProvider: 'google',
          oauthId: `mock_${user._id.toString()}`,
        });
        user = await this.usersRepository.findById(user._id.toString());
      }
      if (!user) throw new UnauthorizedException('OAuth user missing');
      const tokens = await this.issueTokens(user);
      return {
        user: this.sanitize(user),
        ...tokens,
        provider: 'google',
        mode: 'mock',
      };
    }

    if (!input.code) {
      throw new BadRequestException('Missing OAuth code');
    }

    // Minimal token exchange (live Google)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: input.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri:
          this.config.get<string>('oauth.googleCallbackUrl') || '',
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      },
    );
    if (!profileRes.ok) {
      throw new UnauthorizedException('Google profile fetch failed');
    }
    const profile = (await profileRes.json()) as {
      id: string;
      email: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    let user = await this.usersRepository.findByEmail(profile.email);
    if (!user) {
      const hashed = await bcrypt.hash(randomBytes(16).toString('hex'), 12);
      user = await this.usersRepository.create({
        firstName: profile.given_name || 'Google',
        lastName: profile.family_name || 'User',
        email: profile.email.toLowerCase(),
        password: hashed,
        role: Role.JOB_SEEKER,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });
    }
    await this.usersRepository.updateById(user._id.toString(), {
      oauthProvider: 'google',
      oauthId: profile.id,
      avatarUrl: profile.picture || user.avatarUrl,
      isEmailVerified: true,
    });
    user = await this.usersRepository.findById(user._id.toString());
    if (!user) throw new UnauthorizedException('OAuth user missing');
    const tokens = await this.issueTokens(user);
    return {
      user: this.sanitize(user),
      ...tokens,
      provider: 'google',
      mode: 'live',
    };
  }

  private sanitize(user: UserDocument) {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
    };
  }

  private async issueTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: (this.config.get<string>('jwt.accessExpiresIn') ||
          '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ||
          '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.usersRepository.updateById(user._id.toString(), {
      refreshTokenHash,
    });

    return { accessToken, refreshToken };
  }

  private generateToken(): string {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
  }

  private refreshBlacklistKey(token: string): string {
    return `auth:refresh:blacklist:${createHash('sha256').update(token).digest('hex')}`;
  }
}
