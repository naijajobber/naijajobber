import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';
import { User, UserDocument } from '../schemas/user.schema';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
}

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserData): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .exec();
  }

  async findByEmailWithSensitive(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .select('+password +refreshTokenHash')
      .exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
        isDeleted: false,
      })
      .exec();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
        isDeleted: false,
      })
      .exec();
  }

  async updateById(
    id: string,
    update: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        returnDocument: 'after',
      })
      .exec();
  }

  async softDelete(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, isActive: false, deletedAt: new Date() },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findByReferralCode(code: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ referralCode: code, isDeleted: false })
      .exec();
  }

  async countByEmail(email: string): Promise<number> {
    return this.userModel.countDocuments({
      email: email.toLowerCase(),
      isDeleted: false,
    });
  }
}
