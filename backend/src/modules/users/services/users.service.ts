import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Role } from '../../../common/enums/role.enum';
import { UsersRepository } from '../repositories/users.repository';
import { UserDocument } from '../schemas/user.schema';
import { UpdateProfileDto, UpdateUserRoleDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('seed.adminEmail');
    const password = this.config.get<string>('seed.adminPassword');
    if (!email || !password) return;

    const existing = await this.usersRepository.findByEmail(email);
    if (existing) return;

    const hashed = await bcrypt.hash(password, 12);
    await this.usersRepository.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: hashed,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string): Promise<UserDocument> {
    return this.findByIdOrFail(userId);
  }

  /** Ensures the user has a referral code, generating and persisting one if missing. */
  async ensureReferralCode(userId: string): Promise<UserDocument> {
    const user = await this.findByIdOrFail(userId);
    if (user.referralCode) return user;

    const code = this.generateReferralCode(user._id.toString());
    const updated = await this.usersRepository.updateById(userId, {
      referralCode: code,
    });
    return updated || user;
  }

  private generateReferralCode(userId: string): string {
    const suffix = userId.slice(-4).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `NJ${suffix}${random}`;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const updated = await this.usersRepository.updateById(userId, dto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async updateRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserDocument> {
    const updated = await this.usersRepository.updateById(userId, {
      role: dto.role,
    });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async softDelete(userId: string): Promise<void> {
    const deleted = await this.usersRepository.softDelete(userId);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
