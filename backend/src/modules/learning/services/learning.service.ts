import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningItemType } from '../../../common/enums/domain.enum';
import {
  LearningItem,
  LearningItemDocument,
} from '../schemas/learning-item.schema';

@Injectable()
export class LearningService implements OnModuleInit {
  constructor(
    @InjectModel(LearningItem.name)
    private readonly learningItemModel: Model<LearningItemDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.learningItemModel.countDocuments();
    if (count > 0) return;

    const seeds: Partial<LearningItem>[] = [
      {
        title: 'Craft a resume that gets past applicant tracking systems',
        type: LearningItemType.GUIDE,
        body: 'Use standard section headers, avoid tables/images, and mirror keywords from the job description so ATS software can parse your resume correctly.',
        tags: ['resume', 'ats', 'job-search'],
      },
      {
        title: '5 quick wins to improve your LinkedIn profile today',
        type: LearningItemType.TIP,
        body: 'Add a clear headline with your target role, a professional photo, and a summary that highlights measurable achievements.',
        tags: ['linkedin', 'personal-brand'],
      },
      {
        title: 'How to answer "Tell me about yourself" with confidence',
        type: LearningItemType.ARTICLE,
        body: 'Structure your answer around present, past, future: what you do now, how you got here, and what you are looking for next.',
        tags: ['interview', 'communication'],
      },
      {
        title: 'Negotiating your salary: a step-by-step guide',
        type: LearningItemType.GUIDE,
        body: 'Research market rates, anchor high within reason, and always negotiate the full package, not just base salary.',
        tags: ['salary', 'negotiation'],
      },
      {
        title: 'Mastering the STAR method for behavioral interviews',
        type: LearningItemType.VIDEO,
        body: 'Situation, Task, Action, Result — use this structure to tell concise, compelling stories about your past work.',
        tags: ['interview', 'behavioral'],
      },
      {
        title: 'Following up after an interview without being annoying',
        type: LearningItemType.TIP,
        body: 'Send a thank-you note within 24 hours, reference something specific from the conversation, and keep it short.',
        tags: ['interview', 'follow-up'],
      },
      {
        title: 'Building a portfolio that showcases your best work',
        type: LearningItemType.GUIDE,
        body: 'Pick 3-5 strong projects, explain the problem and your role clearly, and always link to live demos or code when possible.',
        tags: ['portfolio', 'career-growth'],
      },
      {
        title: 'Staying motivated during a long job search',
        type: LearningItemType.ARTICLE,
        body: 'Break your search into daily goals, track applications in one place, and celebrate small wins like getting a response.',
        tags: ['motivation', 'job-search'],
      },
    ];

    await this.learningItemModel.insertMany(seeds);
  }

  async listItems(): Promise<LearningItemDocument[]> {
    return this.learningItemModel.find().sort({ createdAt: -1 }).exec();
  }
}
