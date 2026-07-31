import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';
import { paginateMeta } from '../../../common/dto/pagination.dto';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { EmployersService } from '../../employers/services/employers.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { CreateConversationDto, SendMessageDto } from '../dto/messaging.dto';
import { MessagingRepository } from '../repositories/messaging.repository';
import { ConversationDocument } from '../schemas/conversation.schema';

@Injectable()
export class MessagingService {
  constructor(
    private readonly messagingRepository: MessagingRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsService: JobsService,
    private readonly employersService: EmployersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async openConversation(
    userId: string,
    role: string,
    dto: CreateConversationDto,
  ): Promise<ConversationDocument> {
    const application = await this.applicationsRepository.findById(
      dto.applicationId,
    );
    if (!application) throw new NotFoundException('Application not found');

    const job = await this.jobsService.findByIdOrFail(
      application.jobId.toString(),
    );
    const seekerId = application.applicantUserId.toString();
    let employerUserId: string;

    if (role === Role.JOB_SEEKER) {
      if (seekerId !== userId) {
        throw new ForbiddenException('Not your application');
      }
      employerUserId = job.postedByUserId.toString();
    } else if (role === Role.EMPLOYER || role === Role.RECRUITER) {
      const employer =
        await this.employersService.requireEmployerWithCompany(userId);
      if (employer.companyId!.toString() !== job.companyId.toString()) {
        throw new ForbiddenException('Not your company job');
      }
      employerUserId = userId;
    } else {
      throw new ForbiddenException('Cannot open conversation');
    }

    const existing =
      await this.messagingRepository.findByParticipantsAndApplication(
        [seekerId, employerUserId],
        dto.applicationId,
      );
    if (existing) return existing;

    return this.messagingRepository.createConversation({
      participantIds: [
        new Types.ObjectId(seekerId),
        new Types.ObjectId(employerUserId),
      ],
      jobId: job._id,
      applicationId: application._id,
      lastMessageAt: null,
      lastMessagePreview: '',
    });
  }

  async listConversations(userId: string) {
    return this.messagingRepository.listForUser(userId);
  }

  async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDocument> {
    const conversation =
      await this.messagingRepository.findConversationById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');
    const isParticipant = conversation.participantIds.some(
      (id) => id.toString() === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('Not a conversation participant');
    }
    return conversation;
  }

  async listMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    await this.assertParticipant(conversationId, userId);
    const { items, total } = await this.messagingRepository.listMessages(
      conversationId,
      page,
      limit,
    );
    return {
      data: items.reverse(),
      meta: paginateMeta(page, limit, total),
      message: 'OK',
    };
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    const conversation = await this.assertParticipant(conversationId, userId);
    if (!dto.body?.trim() && !(dto.attachments && dto.attachments.length)) {
      throw new BadRequestException('Message body or attachment required');
    }

    const message = await this.messagingRepository.createMessage({
      conversationId: conversation._id,
      senderId: new Types.ObjectId(userId),
      body: dto.body?.trim() || '',
      attachments: (dto.attachments || []).map((a) => ({
        url: a.url,
        mime: a.mime || '',
        name: a.name || '',
      })),
      readBy: [new Types.ObjectId(userId)],
    });

    const preview = (dto.body || '[attachment]').slice(0, 140);
    await this.messagingRepository.updateConversation(conversationId, {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    });

    const recipientId = conversation.participantIds
      .map((id) => id.toString())
      .find((id) => id !== userId);

    if (recipientId) {
      await this.notificationsService.notify({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New message',
        body: preview,
        data: {
          conversationId,
          messageId: message._id.toString(),
        },
      });
    }

    return message;
  }

  async markMessageRead(messageId: string, userId: string) {
    const message = await this.messagingRepository.markRead(messageId, userId);
    if (!message) throw new NotFoundException('Message not found');
    await this.assertParticipant(message.conversationId.toString(), userId);
    return message;
  }
}
