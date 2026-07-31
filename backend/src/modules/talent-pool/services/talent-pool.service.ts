import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployersService } from '../../employers/services/employers.service';
import {
  TalentCandidate,
  TalentCandidateDocument,
} from '../schemas/talent-candidate.schema';

@Injectable()
export class TalentPoolService {
  constructor(
    @InjectModel(TalentCandidate.name)
    private readonly model: Model<TalentCandidateDocument>,
    private readonly employersService: EmployersService,
  ) {}

  async list(userId: string, role: string, folder?: string) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    const filter: Record<string, unknown> = { companyId: emp.companyId };
    if (folder) filter.folder = folder;
    return this.model.find(filter).sort({ updatedAt: -1 }).exec();
  }

  async add(userId: string, role: string, dto: Record<string, unknown>) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    return this.model.create({
      companyId: emp.companyId,
      seekerUserId: new Types.ObjectId(String(dto.seekerUserId)),
      folder: dto.folder || 'Engineering',
      tags: dto.tags || [],
      notes: dto.notes || '',
      rating: dto.rating ?? 3,
    } as never);
  }

  async update(
    userId: string,
    role: string,
    id: string,
    dto: Record<string, unknown>,
  ) {
    await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!updated) throw new NotFoundException('Talent candidate not found');
    return updated;
  }

  async remove(userId: string, role: string, id: string) {
    await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    await this.model.findByIdAndDelete(id).exec();
    return { message: 'Removed' };
  }
}
