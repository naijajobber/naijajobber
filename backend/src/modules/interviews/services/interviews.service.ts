import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewStatus } from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/application.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { CreateInterviewDto, UpdateInterviewDto } from '../dto/interview.dto';
import { InterviewsRepository } from '../repositories/interviews.repository';
import { InterviewDocument } from '../schemas/interview.schema';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly interviewsRepository: InterviewsRepository,
    private readonly notificationsService: NotificationsService,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {}

  async create(
    employerUserId: string,
    dto: CreateInterviewDto,
  ): Promise<InterviewDocument> {
    if (!dto.applicationId) {
      throw new NotFoundException('applicationId is required');
    }
    const application = await this.applicationModel
      .findOne({ _id: dto.applicationId, isDeleted: false })
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const interview = await this.interviewsRepository.create({
      jobId: application.jobId,
      applicationId: application._id,
      seekerUserId: application.applicantUserId,
      employerUserId: new Types.ObjectId(employerUserId),
      scheduledAt: new Date(dto.scheduledAt),
      timezone: dto.timezone || 'UTC',
      meetingLink: dto.meetingLink || '',
      recruiterName: dto.recruiterName || '',
      status: InterviewStatus.SCHEDULED,
      interviewType: dto.interviewType || 'OTHER',
      panelists: dto.panelists || [],
      notes: dto.notes || '',
    });

    await this.notificationsService.notify({
      userId: application.applicantUserId.toString(),
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview scheduled',
      body: 'An interview has been scheduled for your application',
      data: {
        interviewId: interview._id.toString(),
        applicationId: application._id.toString(),
      },
    });

    return interview;
  }

  /** Nice-to-have: auto-create a draft interview 3 days out when an employer moves an application to INTERVIEW, if none already exists. */
  async ensureDraftForApplication(params: {
    jobId: string;
    applicationId: string;
    seekerUserId: string;
    employerUserId: string;
  }): Promise<InterviewDocument | null> {
    const existing = await this.interviewsRepository.findByApplication(
      params.applicationId,
    );
    if (existing) return existing;

    const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const interview = await this.interviewsRepository.create({
      jobId: new Types.ObjectId(params.jobId),
      applicationId: new Types.ObjectId(params.applicationId),
      seekerUserId: new Types.ObjectId(params.seekerUserId),
      employerUserId: new Types.ObjectId(params.employerUserId),
      scheduledAt,
      timezone: 'UTC',
      meetingLink: '',
      recruiterName: '',
      status: InterviewStatus.SCHEDULED,
    });

    await this.notificationsService.notify({
      userId: params.seekerUserId,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview scheduled',
      body: 'A draft interview has been scheduled for your application',
      data: {
        interviewId: interview._id.toString(),
        applicationId: params.applicationId,
      },
    });

    return interview;
  }

  async mine(userId: string): Promise<InterviewDocument[]> {
    return this.interviewsRepository.findBySeeker(userId);
  }

  async forEmployer(userId: string): Promise<InterviewDocument[]> {
    return this.interviewsRepository.findByEmployer(userId);
  }

  async update(
    id: string,
    userId: string,
    role: string,
    dto: UpdateInterviewDto,
  ): Promise<InterviewDocument> {
    const interview = await this.interviewsRepository.findById(id);
    if (!interview) throw new NotFoundException('Interview not found');

    const isPrivileged = role === Role.ADMIN || role === Role.SUPER_ADMIN;
    if (!isPrivileged && interview.employerUserId.toString() !== userId) {
      throw new ForbiddenException('Not allowed to modify this interview');
    }

    const update: Partial<InterviewDocument> = {};
    if (dto.scheduledAt) update.scheduledAt = new Date(dto.scheduledAt);
    if (dto.timezone !== undefined) update.timezone = dto.timezone;
    if (dto.meetingLink !== undefined) update.meetingLink = dto.meetingLink;
    if (dto.recruiterName !== undefined)
      update.recruiterName = dto.recruiterName;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.notes !== undefined) update.notes = dto.notes;

    const updated = await this.interviewsRepository.updateById(id, update);
    if (!updated) throw new NotFoundException('Interview not found');

    if (dto.status) {
      await this.notificationsService.notify({
        userId: interview.seekerUserId.toString(),
        type: 'INTERVIEW_UPDATED',
        title: 'Interview updated',
        body: `Your interview is now ${dto.status}`,
        data: { interviewId: id, status: dto.status },
      });
    }

    return updated;
  }
}
