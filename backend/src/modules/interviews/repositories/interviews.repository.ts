import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument } from '../schemas/interview.schema';

@Injectable()
export class InterviewsRepository {
  constructor(
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
  ) {}

  async create(data: Partial<Interview>): Promise<InterviewDocument> {
    return this.interviewModel.create(data);
  }

  async findById(id: string): Promise<InterviewDocument | null> {
    return this.interviewModel.findById(id).exec();
  }

  async findBySeeker(userId: string): Promise<InterviewDocument[]> {
    return this.interviewModel
      .find({ seekerUserId: new Types.ObjectId(userId) })
      .sort({ scheduledAt: -1 })
      .exec();
  }

  async findByEmployer(userId: string): Promise<InterviewDocument[]> {
    return this.interviewModel
      .find({ employerUserId: new Types.ObjectId(userId) })
      .sort({ scheduledAt: -1 })
      .exec();
  }

  async findByApplication(
    applicationId: string,
  ): Promise<InterviewDocument | null> {
    return this.interviewModel
      .findOne({ applicationId: new Types.ObjectId(applicationId) })
      .exec();
  }

  async updateById(
    id: string,
    update: Partial<Interview>,
  ): Promise<InterviewDocument | null> {
    return this.interviewModel
      .findOneAndUpdate({ _id: id }, update, { returnDocument: 'after' })
      .exec();
  }
}
