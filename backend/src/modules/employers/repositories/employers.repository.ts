import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employer, EmployerDocument } from '../schemas/employer.schema';

@Injectable()
export class EmployersRepository {
  constructor(
    @InjectModel(Employer.name)
    private readonly employerModel: Model<EmployerDocument>,
  ) {}

  async create(data: Partial<Employer>): Promise<EmployerDocument> {
    return this.employerModel.create(data);
  }

  async findByUserId(userId: string): Promise<EmployerDocument | null> {
    return this.employerModel
      .findOne({ userId: new Types.ObjectId(userId), isDeleted: false })
      .exec();
  }

  async findById(id: string): Promise<EmployerDocument | null> {
    return this.employerModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async updateById(
    id: string,
    update: Partial<Employer>,
  ): Promise<EmployerDocument | null> {
    return this.employerModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        returnDocument: 'after',
      })
      .exec();
  }

  async updateByUserId(
    userId: string,
    update: Partial<Employer>,
  ): Promise<EmployerDocument | null> {
    return this.employerModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), isDeleted: false },
        update,
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findAll(limit = 50): Promise<EmployerDocument[]> {
    return this.employerModel
      .find({ isDeleted: false })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCompanyId(companyId: string): Promise<EmployerDocument[]> {
    return this.employerModel
      .find({
        companyId: new Types.ObjectId(companyId),
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
