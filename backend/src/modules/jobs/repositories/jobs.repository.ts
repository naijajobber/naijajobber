import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobStatus } from '../../../common/enums/domain.enum';
import { Job, JobDocument } from '../schemas/job.schema';

export interface JobSearchFilters {
  q?: string;
  employmentType?: string;
  workplaceType?: string;
  category?: string;
  experienceLevel?: string;
  skills?: string[];
  isFeatured?: boolean;
  status?: JobStatus;
  companyId?: string;
  page: number;
  limit: number;
  sort?: 'recent' | 'salary';
}

@Injectable()
export class JobsRepository {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
  ) {}

  async create(data: Partial<Job>): Promise<JobDocument> {
    return this.jobModel.create(data);
  }

  async findById(id: string): Promise<JobDocument | null> {
    return this.jobModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<JobDocument | null> {
    return this.jobModel
      .findOne({ slug: slug.toLowerCase(), isDeleted: false })
      .exec();
  }

  async updateById(
    id: string,
    update: Partial<Job>,
  ): Promise<JobDocument | null> {
    return this.jobModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        returnDocument: 'after',
      })
      .exec();
  }

  async softDelete(id: string): Promise<JobDocument | null> {
    return this.jobModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), status: JobStatus.CLOSED },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.jobModel.countDocuments({
      companyId: new Types.ObjectId(companyId),
      isDeleted: false,
    });
  }

  async search(filters: JobSearchFilters): Promise<{
    items: JobDocument[];
    total: number;
  }> {
    const query: Record<string, unknown> = { isDeleted: false };

    if (filters.status) query.status = filters.status;
    if (filters.companyId) {
      query.companyId = new Types.ObjectId(filters.companyId);
    }
    if (filters.employmentType) query.employmentType = filters.employmentType;
    if (filters.workplaceType) query.workplaceType = filters.workplaceType;
    if (filters.category) query.category = filters.category;
    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }
    if (typeof filters.isFeatured === 'boolean') {
      query.isFeatured = filters.isFeatured;
    }
    if (filters.skills?.length) query.skills = { $all: filters.skills };
    if (filters.q?.trim()) query.$text = { $search: filters.q.trim() };

    const sort: Record<string, 1 | -1> =
      filters.sort === 'salary'
        ? { salaryMax: -1, createdAt: -1 }
        : { publishedAt: -1, createdAt: -1 };

    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([
      this.jobModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      this.jobModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async findMine(companyId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({
        companyId: new Types.ObjectId(companyId),
        isDeleted: false,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }
}
