import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../schemas/application.schema';

@Injectable()
export class ApplicationsRepository {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {}

  async create(data: Partial<Application>): Promise<ApplicationDocument> {
    return this.applicationModel.create(data);
  }

  async findById(id: string): Promise<ApplicationDocument | null> {
    return this.applicationModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findByJobAndApplicant(
    jobId: string,
    applicantUserId: string,
  ): Promise<ApplicationDocument | null> {
    return this.applicationModel
      .findOne({
        jobId: new Types.ObjectId(jobId),
        applicantUserId: new Types.ObjectId(applicantUserId),
        isDeleted: false,
      })
      .exec();
  }

  async findByApplicant(userId: string): Promise<ApplicationDocument[]> {
    return this.applicationModel
      .find({
        applicantUserId: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByJob(jobId: string): Promise<ApplicationDocument[]> {
    return this.applicationModel
      .find({
        jobId: new Types.ObjectId(jobId),
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateById(
    id: string,
    update: Partial<Application>,
  ): Promise<ApplicationDocument | null> {
    return this.applicationModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        returnDocument: 'after',
      })
      .exec();
  }
}
