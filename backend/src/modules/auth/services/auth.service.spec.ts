import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../common/enums/role.enum';
import { MailService } from '../../../infrastructure/mail/mail.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-value'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;
  let redis: jest.Mocked<RedisService>;

  const userDoc = {
    _id: { toString: () => 'user-1' },
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Okafor',
    role: Role.JOB_SEEKER,
    isEmailVerified: true,
    password: 'hashed',
    refreshTokenHash: null as string | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      findByVerificationToken: jest.fn(),
      findByPasswordResetToken: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    usersService = {
      validateCredentials: jest.fn(),
      ensureReferralCode: jest.fn().mockResolvedValue(userDoc),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const config = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          'jwt.accessExpiresIn': '15m',
          'jwt.refreshExpiresIn': '7d',
        };
        return map[key];
      }),
      getOrThrow: jest.fn((key: string) => {
        const map: Record<string, string> = {
          'jwt.accessSecret': 'access-secret-min-16',
          'jwt.refreshSecret': 'refresh-secret-min-16',
        };
        return map[key];
      }),
    } as unknown as ConfigService;

    mailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    } as unknown as jest.Mocked<MailService>;

    redis = {
      set: jest.fn(),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;

    service = new AuthService(
      usersRepository,
      usersService,
      jwtService,
      config,
      mailService,
      redis,
    );
  });

  it('registers a new user and sends verification email', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(userDoc as never);

    const result = await service.register({
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@example.com',
      password: 'SecurePass1!',
    });

    expect(usersRepository.create).toHaveBeenCalled();
    expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    expect(result.user.email).toBe('ada@example.com');
  });

  it('rejects duplicate registration', async () => {
    usersRepository.findByEmail.mockResolvedValue(userDoc as never);
    await expect(
      service.register({
        firstName: 'Ada',
        lastName: 'Okafor',
        email: 'ada@example.com',
        password: 'SecurePass1!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in verified users and returns tokens', async () => {
    usersService.validateCredentials.mockResolvedValue(userDoc as never);
    usersRepository.updateById.mockResolvedValue(userDoc as never);

    const result = await service.login({
      email: 'ada@example.com',
      password: 'SecurePass1!',
    });

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(result.user.email).toBe('ada@example.com');
  });

  it('blocks login when email is not verified', async () => {
    usersService.validateCredentials.mockResolvedValue({
      ...userDoc,
      isEmailVerified: false,
    } as never);

    await expect(
      service.login({ email: 'ada@example.com', password: 'SecurePass1!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
