import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from '../../../common/enums/domain.enum';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { ApplicationsService } from '../../applications/services/applications.service';
import { EmployersService } from '../../employers/services/employers.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { Offer, OfferDocument } from '../schemas/offer.schema';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<OfferDocument>,
    private readonly employersService: EmployersService,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly applicationsService: ApplicationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(userId: string, role: string) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    return this.offerModel
      .find({ companyId: emp.companyId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(userId: string, role: string, dto: Record<string, unknown>) {
    const emp = await this.employersService.requireEmployerWithCompany(userId);
    this.employersService.ensureEmployerRole(role);
    const app = await this.applicationsRepository.findById(
      String(dto.applicationId),
    );
    if (!app) throw new NotFoundException('Application not found');
    const offer = await this.offerModel.create({
      companyId: emp.companyId,
      applicationId: app._id,
      seekerUserId: app.applicantUserId,
      position: String(dto.position || ''),
      salary: String(dto.salary || ''),
      benefits: String(dto.benefits || ''),
      startDate: String(dto.startDate || ''),
      employmentType: String(dto.employmentType || 'FULL_TIME'),
      status: 'PENDING',
    } as never);
    await this.applicationsService.updateStatus(
      String(app._id),
      userId,
      role,
      { status: ApplicationStatus.OFFER, note: 'Offer extended' },
    );
    await this.notificationsService.notify({
      userId: app.applicantUserId.toString(),
      type: 'OFFER',
      title: 'You received a job offer',
      body: String(dto.position || 'New offer'),
      data: { offerId: String((offer as { _id: Types.ObjectId })._id) },
    });
    return offer;
  }

  async accept(seekerUserId: string, offerId: string) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.seekerUserId.toString() !== seekerUserId) {
      throw new NotFoundException('Offer not found');
    }
    offer.status = 'ACCEPTED';
    await offer.save();
    return offer;
  }
}
