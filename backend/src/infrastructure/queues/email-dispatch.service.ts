import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { EMAIL_QUEUE, EmailJobPayload } from './queue.constants';

@Injectable()
export class EmailDispatchService {
  private readonly logger = new Logger(EmailDispatchService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly mailService: MailService,
  ) {}

  async enqueue(payload: EmailJobPayload): Promise<void> {
    try {
      await this.emailQueue.add('send', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      });
    } catch (error) {
      this.logger.warn(
        `Queue unavailable, sending email inline: ${(error as Error).message}`,
      );
      await this.mailService.sendMail(payload);
    }
  }
}
