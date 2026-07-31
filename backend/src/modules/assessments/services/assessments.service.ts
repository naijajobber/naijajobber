import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from '../../../common/enums/domain.enum';
import { ApplicationsService } from '../../applications/services/applications.service';
import { EmployersService } from '../../employers/services/employers.service';
import {
  Assessment,
  AssessmentDocument,
  AssessmentSubmission,
  AssessmentSubmissionDocument,
} from '../schemas/assessment.schema';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel(AssessmentSubmission.name)
    private readonly submissionModel: Model<AssessmentSubmissionDocument>,
    private readonly employersService: EmployersService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async list(userId: string, role: string) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    return this.assessmentModel
      .find({ companyId: emp.companyId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(userId: string, role: string, dto: Record<string, unknown>) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    return this.assessmentModel.create({
      companyId: emp.companyId,
      title: dto.title || 'Assessment',
      type: dto.type || 'ESSAY',
      questions: dto.questions || [],
    } as never);
  }

  async send(
    userId: string,
    role: string,
    assessmentId: string,
    applicationId: string,
  ) {
    await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    const assessment = await this.assessmentModel.findById(assessmentId).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');
    const submission = await this.submissionModel.create({
      assessmentId: new Types.ObjectId(assessmentId),
      applicationId: new Types.ObjectId(applicationId),
      score: Math.floor(60 + Math.random() * 40),
      status: 'SCORED',
    });
    await this.applicationsService.updateStatus(applicationId, userId, role, {
      status: ApplicationStatus.ASSESSMENT,
      note: 'Assessment sent',
    });
    return submission;
  }
}
