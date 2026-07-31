import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobStatus } from '../../../common/enums/domain.enum';
import { EmailDispatchService } from '../../../infrastructure/queues/email-dispatch.service';
import { Job, JobDocument } from '../../jobs/schemas/job.schema';
import { UsersRepository } from '../../users/repositories/users.repository';
import {
  SeekerProfile,
  SeekerProfileDocument,
} from '../schemas/seeker-profile.schema';

@Injectable()
export class JobAlertsService {
  private readonly logger = new Logger(JobAlertsService.name);

  constructor(
    @InjectModel(SeekerProfile.name)
    private readonly profileModel: Model<SeekerProfileDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly emailDispatch: EmailDispatchService,
  ) {}

  /** Plan: BullMQ alerts queue — enqueue via email queue path with inline fallback. */
  async enqueueDigest() {
    try {
      const result = await this.runDigest();
      return { message: 'Digest completed', ...result };
    } catch (err) {
      this.logger.error(`Digest failed: ${(err as Error).message}`);
      throw err;
    }
  }

  async runDigest() {
    const since = new Date(Date.now() - 7 * 86400000);
    const recentJobs = await this.jobModel
      .find({
        status: JobStatus.PUBLISHED,
        isDeleted: false,
        createdAt: { $gte: since },
      })
      .limit(20)
      .exec();

    const subscribers = await this.profileModel
      .find({ 'jobAlertPrefs.enabled': true })
      .exec();

    let sent = 0;
    for (const sub of subscribers) {
      const keywords = (sub.jobAlertPrefs?.keywords || []).map((k) =>
        k.toLowerCase(),
      );
      const matched = recentJobs.filter((j) => {
        if (!keywords.length) return true;
        const hay =
          `${j.title} ${j.description} ${(j.skills || []).join(' ')}`.toLowerCase();
        return keywords.some((k) => hay.includes(k));
      });
      if (!matched.length) continue;
      const user = await this.usersRepository.findById(sub.userId.toString());
      if (!user?.email) continue;
      const list = matched
        .slice(0, 5)
        .map((j) => `<li>${j.title}</li>`)
        .join('');
      await this.emailDispatch.enqueue({
        to: user.email,
        subject: 'NaijaJobber job alert digest',
        html: `<p>New roles matching your alerts:</p><ul>${list}</ul>`,
      });
      sent += 1;
    }
    return { sent, jobsConsidered: recentJobs.length };
  }
}
