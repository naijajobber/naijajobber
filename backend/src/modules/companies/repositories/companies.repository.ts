import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async create(data: Partial<Company>): Promise<CompanyDocument> {
    return this.companyModel.create(data);
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return this.companyModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return this.companyModel
      .findOne({ slug: slug.toLowerCase(), isDeleted: false })
      .exec();
  }

  async updateById(
    id: string,
    update: Partial<Company>,
  ): Promise<CompanyDocument | null> {
    return this.companyModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        returnDocument: 'after',
      })
      .exec();
  }

  async softDelete(id: string): Promise<CompanyDocument | null> {
    return this.companyModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
