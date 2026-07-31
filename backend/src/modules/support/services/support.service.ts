import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployersService } from '../../employers/services/employers.service';
import {
  SupportTicket,
  SupportTicketDocument,
} from '../schemas/support-ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
    private readonly employersService: EmployersService,
  ) {}

  async list(userId: string) {
    return this.ticketModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(userId: string, role: string, dto: Record<string, unknown>) {
    let companyId: Types.ObjectId | null = null;
    try {
      this.employersService.ensureEmployerRole(role);
      const emp = await this.employersService.getMe(userId, role);
      companyId = emp.companyId;
    } catch {
      companyId = null;
    }
    return this.ticketModel.create({
      userId: new Types.ObjectId(userId),
      companyId,
      subject: dto.subject || 'Support request',
      category: dto.category || 'General',
      body: dto.body || '',
      status: 'OPEN',
    } as never);
  }
}
