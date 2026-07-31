import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiRun, AiRunDocument, AiRunType } from '../schemas/ai-run.schema';

@Injectable()
export class AiRepository {
  constructor(
    @InjectModel(AiRun.name) private readonly aiRunModel: Model<AiRunDocument>,
  ) {}

  create(data: {
    userId: string;
    type: AiRunType;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    modelName: string;
    tokensUsed: number;
    status?: string;
  }) {
    return this.aiRunModel.create({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      input: data.input,
      output: data.output,
      modelName: data.modelName,
      tokensUsed: data.tokensUsed,
      status: data.status || 'SUCCESS',
    });
  }

  listForUser(userId: string, limit = 20) {
    return this.aiRunModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  countToday(userId: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return this.aiRunModel.countDocuments({
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: start },
    });
  }
}
