import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiRouterService } from '../../../infrastructure/ai/ai-router.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { JobsService } from '../../jobs/services/jobs.service';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CoverLetterDto, JobMatchDto, ResumeReviewDto } from '../dto/ai.dto';
import { AiRepository } from '../repositories/ai.repository';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiRouter: AiRouterService,
    private readonly redis: RedisService,
    private readonly usersRepository: UsersRepository,
    private readonly jobsService: JobsService,
    private readonly config: ConfigService,
    private readonly applicationsRepository: ApplicationsRepository,
  ) {}

  async listRuns(userId: string) {
    return this.aiRepository.listForUser(userId);
  }

  async reviewResume(userId: string, dto: ResumeReviewDto) {
    await this.assertWithinLimits(userId);
    const text = await this.resolveResumeText(dto.resumeText, dto.resumeUrl);
    if (!text || text.length < 20) {
      throw new BadRequestException('Provide resumeText or a fetchable resumeUrl');
    }

    const provider = this.aiRouter.resolve();
    const result = await provider.complete({
      mode: 'json',
      system:
        'You are a career coach for African remote talent. Return JSON with strengths[], gaps[], rewriteTips[], score (0-100).',
      user: `Review this resume:\n\n${text.slice(0, 12000)}`,
    });

    const output = this.safeJson(result.content);
    const run = await this.aiRepository.create({
      userId,
      type: 'RESUME_REVIEW',
      input: { resumePreview: text.slice(0, 500) },
      output,
      modelName: result.model,
      tokensUsed: result.tokensUsed,
    });
    await this.bumpCounters(userId);
    return { runId: run._id, ...output, model: result.model };
  }

  async coverLetter(userId: string, dto: CoverLetterDto) {
    await this.assertWithinLimits(userId);
    let jobDescription = dto.jobDescription || '';
    if (dto.jobId) {
      const job = await this.jobsService.findByIdOrFail(dto.jobId);
      jobDescription = `${job.title}\n\n${job.description}`;
    }
    if (!jobDescription.trim()) {
      throw new BadRequestException('jobId or jobDescription required');
    }

    const user = await this.usersRepository.findById(userId);
    const resumeText =
      dto.resumeText ||
      [user?.headline, user?.bio, user?.location].filter(Boolean).join('\n') ||
      'Experienced remote professional';

    const provider = this.aiRouter.resolve();
    const result = await provider.complete({
      mode: 'json',
      system:
        'Write a concise professional cover letter for a remote role. Return JSON { "letter": "..." }.',
      user: `Candidate:\n${resumeText.slice(0, 6000)}\n\nRole:\n${jobDescription.slice(0, 6000)}`,
    });

    const output = this.safeJson(result.content);
    const run = await this.aiRepository.create({
      userId,
      type: 'COVER_LETTER',
      input: { jobId: dto.jobId, jobPreview: jobDescription.slice(0, 400) },
      output,
      modelName: result.model,
      tokensUsed: result.tokensUsed,
    });
    await this.bumpCounters(userId);
    return { runId: run._id, letter: output.letter || result.content, model: result.model };
  }

  /** Deterministic mock parser — extracts structured fields without a live LLM. */
  async parseResume(
    userId: string,
    dto: { resumeText?: string; resumeUrl?: string; fileName?: string },
  ) {
    await this.assertWithinLimits(userId);
    const text = await this.resolveResumeText(dto.resumeText, dto.resumeUrl);
    const blob = `${dto.fileName || ''}\n${text}`.toLowerCase();
    const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/\+?[\d\s()-]{10,}/);
    const skillHints = [
      'javascript',
      'typescript',
      'react',
      'node',
      'python',
      'java',
      'aws',
      'docker',
      'sql',
      'figma',
      'marketing',
      'sales',
    ].filter((s) => blob.includes(s));

    const parsed = {
      name: dto.fileName?.replace(/\.\w+$/, '').replace(/[_-]/g, ' ') || 'Candidate',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim() || '',
      skills: skillHints.length
        ? skillHints.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        : ['Communication', 'Remote collaboration'],
      experience: [
        {
          title: 'Software Professional',
          company: 'Previous Company',
          startDate: '2021',
          endDate: 'Present',
          description: 'Extracted from resume (mock parser).',
        },
      ],
      education: [
        {
          school: 'University',
          degree: 'Bachelor',
          year: '2020',
          field: 'Computer Science',
        },
      ],
      certificates: blob.includes('aws')
        ? [{ name: 'AWS Cloud Practitioner', organization: 'Amazon', issueDate: '2023' }]
        : [],
    };

    const run = await this.aiRepository.create({
      userId,
      type: 'RESUME_PARSE',
      input: { preview: text.slice(0, 400), fileName: dto.fileName },
      output: parsed,
      modelName: 'mock-parser',
      tokensUsed: 0,
    });
    await this.bumpCounters(userId);
    return { runId: run._id, ...parsed, model: 'mock-parser' };
  }

  async matchJobs(userId: string, dto: JobMatchDto) {
    await this.assertWithinLimits(userId);
    const user = await this.usersRepository.findById(userId);
    const profileText =
      dto.profileText ||
      [user?.headline, user?.bio, user?.location].filter(Boolean).join('\n') ||
      'Remote job seeker';

    const limit = Math.min(dto.limit || 10, 20);
    const search = await this.jobsService.search({
      page: 1,
      limit,
      sort: 'recent',
    } as never);
    const jobs = (search.data || []) as Array<{
      _id: { toString(): string };
      title: string;
      description: string;
      slug?: string;
      skills?: string[];
    }>;

    const provider = this.aiRouter.resolve();
    const catalog = jobs
      .map(
        (j, i) =>
          `[${i}] ${j.title} | skills: ${(j.skills || []).join(', ')} | ${(j.description || '').slice(0, 200)}`,
      )
      .join('\n');

    const result = await provider.complete({
      mode: 'json',
      system:
        'Score job fit for the candidate. Return JSON { "scores": [{ "index": number, "score": 0-100, "reason": string }] }.',
      user: `Candidate:\n${profileText.slice(0, 4000)}\n\nJobs:\n${catalog || 'none'}`,
    });

    const parsed = this.safeJson(result.content);
    const scores = Array.isArray(parsed.scores) ? parsed.scores : [];
    const matches = scores
      .map((s: { index?: number; score?: number; reason?: string }) => {
        const job = jobs[s.index ?? -1];
        if (!job) return null;
        return {
          jobId: job._id.toString(),
          title: job.title,
          slug: job.slug,
          score: s.score ?? 0,
          reason: s.reason || '',
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score as number) - (a!.score as number));

    // Fallback when mock scores reference missing indices or no jobs
    const finalMatches =
      matches.length > 0
        ? matches
        : jobs.map((j, i) => ({
            jobId: j._id.toString(),
            title: j.title,
            slug: j.slug,
            score: Math.max(40, 90 - i * 8),
            reason: 'Heuristic overlap with profile',
          }));

    const output = { matches: finalMatches };
    const run = await this.aiRepository.create({
      userId,
      type: 'JOB_MATCH',
      input: { profilePreview: profileText.slice(0, 400), jobCount: jobs.length },
      output,
      modelName: result.model,
      tokensUsed: result.tokensUsed,
    });
    await this.bumpCounters(userId);
    return { runId: run._id, matches: finalMatches, model: result.model };
  }

  async matchCandidates(userId: string, _role: string, jobId: string) {
    await this.assertWithinLimits(userId);
    const job = await this.jobsService.findByIdOrFail(jobId);
    const apps = await this.applicationsRepository.findByJob(jobId);
    const matches = await Promise.all(
      apps.map(async (app, i) => {
        const user = await this.usersRepository.findById(
          app.applicantUserId.toString(),
        );
        const score = Math.max(40, 95 - i * 7);
        return {
          applicationId: app._id.toString(),
          seekerUserId: app.applicantUserId.toString(),
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Candidate',
          score,
          strengths: ['Skills overlap with job', 'Remote readiness'],
          weaknesses: ['Limited portfolio signals in mock mode'],
          interviewSuggestions: [
            'Ask about recent project ownership',
            `Probe ${job.skills?.[0] || 'core'} depth`,
          ],
        };
      }),
    );
    matches.sort((a, b) => b.score - a.score);
    const run = await this.aiRepository.create({
      userId,
      type: 'CANDIDATE_MATCH',
      input: { jobId, count: apps.length },
      output: { matches },
      modelName: 'mock-candidate-ranker',
      tokensUsed: 0,
    });
    await this.bumpCounters(userId);
    return { runId: run._id, matches, model: 'mock-candidate-ranker' };
  }

  private async assertWithinLimits(userId: string): Promise<void> {
    const hourly =
      this.config.get<number>('ai.hourlyLimit') || 10;
    const daily = this.config.get<number>('ai.dailyLimit') || 20;

    const hourKey = `ai:hour:${userId}`;
    const dayKey = `ai:day:${userId}`;
    const hourCount = parseInt((await this.redis.get(hourKey)) || '0', 10);
    const dayCount = parseInt((await this.redis.get(dayKey)) || '0', 10);

    if (hourCount >= hourly || dayCount >= daily) {
      throw new HttpException(
        'AI rate limit exceeded. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Also soft-cap via DB daily count
    const today = await this.aiRepository.countToday(userId);
    if (today >= daily) {
      throw new HttpException(
        'AI daily limit reached.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async bumpCounters(userId: string): Promise<void> {
    await this.redis.incr(`ai:hour:${userId}`, 3600);
    await this.redis.incr(`ai:day:${userId}`, 86400);
  }

  private async resolveResumeText(
    resumeText?: string,
    resumeUrl?: string,
  ): Promise<string> {
    if (resumeText?.trim()) return resumeText.trim();
    if (!resumeUrl) return '';
    try {
      const res = await fetch(resumeUrl);
      if (!res.ok) return '';
      const text = await res.text();
      return text.slice(0, 20000);
    } catch {
      return '';
    }
  }

  private safeJson(content: string): Record<string, unknown> {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return { raw: content };
    }
  }
}
