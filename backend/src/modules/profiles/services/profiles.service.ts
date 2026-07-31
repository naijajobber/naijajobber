import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { UploadService } from '../../../infrastructure/uploads/upload.service';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/application.schema';
import { UsersRepository } from '../../users/repositories/users.repository';
import { JobsRepository } from '../../jobs/repositories/jobs.repository';
import {
  UpdateJobAlertPrefsDto,
  UpdateSeekerProfileDto,
  UpdateSettingsDto,
} from '../dto/profile.dto';
import { SavedJob, SavedJobDocument } from '../schemas/saved-job.schema';
import {
  SeekerProfile,
  SeekerProfileDocument,
} from '../schemas/seeker-profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(SeekerProfile.name)
    private readonly profileModel: Model<SeekerProfileDocument>,
    @InjectModel(SavedJob.name)
    private readonly savedJobModel: Model<SavedJobDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly jobsRepository: JobsRepository,
    private readonly uploadService: UploadService,
    private readonly config: ConfigService,
  ) {}

  async getOrCreateMe(userId: string) {
    let profile = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!profile) {
      profile = await this.profileModel.create({
        userId: new Types.ObjectId(userId),
      });
    }
    return profile;
  }

  async updateMe(userId: string, dto: UpdateSeekerProfileDto) {
    const profile = await this.getOrCreateMe(userId);
    Object.assign(profile, dto);
    await profile.save();
    return profile;
  }

  async getByUserId(
    viewerId: string | null,
    viewerRole: string | null,
    userId: string,
  ) {
    const profile = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!profile) throw new NotFoundException('Profile not found');

    if (viewerId === userId) return profile;

    if (profile.visibility === 'PUBLIC') return profile;
    if (
      profile.visibility === 'EMPLOYERS' &&
      (viewerRole === Role.EMPLOYER ||
        viewerRole === Role.RECRUITER ||
        viewerRole === Role.ADMIN ||
        viewerRole === Role.SUPER_ADMIN)
    ) {
      return profile;
    }
    throw new ForbiddenException('Profile is private');
  }

  async uploadCv(userId: string, file: Express.Multer.File) {
    const saved = await this.uploadService.saveFile(file);
    const profile = await this.getOrCreateMe(userId);
    profile.cvPdfUrl = saved.url;
    const version = (profile.cvFiles?.length || 0) + 1;
    profile.cvFiles = [
      ...(profile.cvFiles || []).map((f) => ({ ...f, isDefault: false })),
      {
        url: saved.url,
        name: saved.name,
        mime: saved.mime,
        version,
        isDefault: true,
        uploadedAt: new Date(),
      },
    ];
    await profile.save();
    return profile;
  }

  async setPrimaryCv(userId: string, url: string) {
    const profile = await this.getOrCreateMe(userId);
    const found = (profile.cvFiles || []).find((f) => f.url === url);
    if (!found && profile.cvPdfUrl !== url) {
      throw new NotFoundException('CV file not found');
    }
    profile.cvPdfUrl = url;
    profile.cvFiles = (profile.cvFiles || []).map((f) => ({
      ...f,
      isDefault: f.url === url,
    }));
    await profile.save();
    return profile;
  }

  async deleteCv(userId: string, url: string) {
    const profile = await this.getOrCreateMe(userId);
    profile.cvFiles = (profile.cvFiles || []).filter((f) => f.url !== url);
    if (profile.cvPdfUrl === url) {
      profile.cvPdfUrl = profile.cvFiles[0]?.url || '';
      if (profile.cvFiles[0]) profile.cvFiles[0].isDefault = true;
    }
    await profile.save();
    return profile;
  }

  async replaceCv(userId: string, url: string, file: Express.Multer.File) {
    const profile = await this.getOrCreateMe(userId);
    const idx = (profile.cvFiles || []).findIndex((f) => f.url === url);
    if (idx < 0) throw new NotFoundException('CV file not found');
    const saved = await this.uploadService.saveFile(file);
    const prev = profile.cvFiles[idx];
    profile.cvFiles[idx] = {
      url: saved.url,
      name: saved.name,
      mime: saved.mime,
      version: (prev.version || 1) + 1,
      isDefault: prev.isDefault || profile.cvPdfUrl === url,
      uploadedAt: new Date(),
    };
    if (profile.cvPdfUrl === url) profile.cvPdfUrl = saved.url;
    await profile.save();
    return profile;
  }

  async applyParsedResume(
    userId: string,
    parsed: {
      skills?: string[];
      experience?: Array<Record<string, string>>;
      education?: Array<Record<string, string>>;
      certificates?: Array<Record<string, string>>;
      email?: string;
      phone?: string;
      name?: string;
    },
  ) {
    const profile = await this.getOrCreateMe(userId);
    if (parsed.skills?.length) {
      profile.skills = Array.from(
        new Set([...(profile.skills || []), ...parsed.skills]),
      );
    }
    if (parsed.experience?.length) {
      profile.experience = [
        ...(profile.experience || []),
        ...parsed.experience.map((e) => ({
          title: e.title || '',
          company: e.company || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          description: e.description || '',
          employmentType: '',
          location: '',
          currentlyWorking: false,
          achievements: '',
          technologies: [] as string[],
        })),
      ];
    }
    if (parsed.education?.length) {
      profile.education = [
        ...(profile.education || []),
        ...parsed.education.map((e) => ({
          school: e.school || '',
          degree: e.degree || '',
          year: e.year || '',
          field: e.field || '',
          grade: '',
          startDate: '',
          endDate: '',
          achievements: '',
        })),
      ];
    }
    if (parsed.certificates?.length) {
      profile.certificates = [
        ...(profile.certificates || []),
        ...parsed.certificates.map((c) => ({
          name: c.name || '',
          organization: c.organization || '',
          issueDate: c.issueDate || '',
          expiryDate: '',
          credentialUrl: '',
          credentialId: '',
          fileUrl: '',
        })),
      ];
    }
    await profile.save();
    if (parsed.phone || parsed.name) {
      const [firstName, ...rest] = (parsed.name || '').split(' ');
      await this.usersRepository.updateById(userId, {
        ...(parsed.phone ? { phone: parsed.phone } : {}),
        ...(firstName
          ? { firstName, lastName: rest.join(' ') || undefined }
          : {}),
      });
    }
    return profile;
  }

  async getInsights(userId: string) {
    const profile = await this.getOrCreateMe(userId);
    const applications = await this.applicationModel
      .find({
        applicantUserId: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .select('status createdAt')
      .exec();

    const totalApplications = applications.length;

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(ApplicationStatus)) {
      byStatus[status] = 0;
    }
    for (const application of applications) {
      byStatus[application.status] = (byStatus[application.status] || 0) + 1;
    }

    const interviewReached = applications.filter((application) =>
      [
        ApplicationStatus.ASSESSMENT,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER,
      ].includes(application.status),
    ).length;
    const offers = byStatus[ApplicationStatus.OFFER] || 0;

    const interviewRate = totalApplications
      ? Math.round((interviewReached / totalApplications) * 100)
      : 0;
    const offerRate = totalApplications
      ? Math.round((offers / totalApplications) * 100)
      : 0;

    const monthlyTrend: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyTrend.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        count: 0,
      });
    }
    const monthIndex = new Map(
      monthlyTrend.map((entry, idx) => [entry.month, idx]),
    );
    for (const application of applications) {
      const createdAt = application.createdAt;
      if (!createdAt) continue;
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      const idx = monthIndex.get(key);
      if (idx !== undefined) monthlyTrend[idx].count += 1;
    }

    return {
      profileViews: profile.profileViews || 0,
      resumeDownloads: profile.resumeDownloads || 0,
      skillsCount: (profile.skills || []).length,
      experienceCount: (profile.experience || []).length,
      certificatesCount: (profile.certificates || []).length,
      totalApplications,
      byStatus,
      interviewRate,
      offerRate,
      monthlyTrend,
    };
  }

  async toggleLearningBookmark(userId: string, itemId: string) {
    const profile = await this.getOrCreateMe(userId);
    const bookmarks = new Set(profile.learningBookmarks || []);
    let bookmarked: boolean;
    if (bookmarks.has(itemId)) {
      bookmarks.delete(itemId);
      bookmarked = false;
    } else {
      bookmarks.add(itemId);
      bookmarked = true;
    }
    profile.learningBookmarks = Array.from(bookmarks);
    await profile.save();
    return { bookmarked, learningBookmarks: profile.learningBookmarks };
  }

  /** Builds a real HTML CV file under /uploads (not a fake PDF URL). */
  async generateCvDocument(userId: string, template = 'professional') {
    const profile = await this.getOrCreateMe(userId);
    const user = await this.usersRepository.findById(userId);
    const base =
      this.config.get<string>('apiPublicUrl') ||
      process.env.API_PUBLIC_URL ||
      'http://localhost:3001';

    const themes: Record<string, string> = {
      modern:
        'font-family: system-ui,sans-serif; color:#0f172a; --accent:#16a34a;',
      professional:
        'font-family: Georgia, serif; color:#111; --accent:#166534;',
      creative:
        'font-family: "Trebuchet MS",sans-serif; color:#1e1b4b; --accent:#7c3aed;',
      minimal:
        'font-family: Helvetica, Arial, sans-serif; color:#222; --accent:#444;',
    };
    const theme = themes[template] || themes.professional;

    const name =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      'Candidate';
    const skills = (profile.skills || []).join(', ');
    const experience = (profile.experience || [])
      .map(
        (e) =>
          `<li><strong>${e.title || ''}</strong> — ${e.company || ''} (${e.startDate || ''}–${e.endDate || ''})<br/>${e.description || ''}</li>`,
      )
      .join('');
    const education = (profile.education || [])
      .map(
        (e) =>
          `<li>${e.degree || ''} — ${e.school || ''} (${e.year || ''})</li>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${name} — CV</title>
  <style>
    body { ${theme} max-width: 720px; margin: 2rem auto; line-height: 1.5; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; color: var(--accent); }
    h2 { font-size: 1.1rem; margin-top: 1.5rem; border-bottom: 1px solid #ccc; }
    .meta { color: #444; font-size: 0.95rem; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <p class="meta">${user?.headline || ''}<br/>${user?.location || ''}<br/>${user?.email || ''}</p>
  <p>${user?.bio || ''}</p>
  <h2>Skills</h2>
  <p>${skills || '—'}</p>
  <h2>Experience</h2>
  <ul>${experience || '<li>—</li>'}</ul>
  <h2>Education</h2>
  <ul>${education || '<li>—</li>'}</ul>
</body>
</html>`;

    const filename = `cv-${userId}-${Date.now()}.html`;
    const uploadDir = join(process.cwd(), 'uploads');
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), html, 'utf8');
    const url = `${base}/uploads/${filename}`;
    profile.cvPdfUrl = url;
    const version = (profile.cvFiles?.length || 0) + 1;
    profile.cvFiles = [
      ...(profile.cvFiles || []).map((f) => ({ ...f, isDefault: false })),
      {
        url,
        name: filename,
        mime: 'text/html',
        version,
        isDefault: true,
        uploadedAt: new Date(),
      },
    ];
    profile.cvJson = {
      ...profile.cvJson,
      generatedAt: new Date().toISOString(),
      format: 'html',
      template,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
    };
    await profile.save();
    return profile;
  }

  async getCvUrlForUser(userId: string): Promise<string> {
    const profile = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    return profile?.cvPdfUrl || '';
  }

  async updateAlertPrefs(userId: string, dto: UpdateJobAlertPrefsDto) {
    const profile = await this.getOrCreateMe(userId);
    profile.jobAlertPrefs = {
      ...profile.jobAlertPrefs,
      ...dto,
      keywords: dto.keywords ?? profile.jobAlertPrefs?.keywords ?? [],
    };
    await profile.save();
    return profile.jobAlertPrefs;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const updated = await this.usersRepository.updateById(userId, dto);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async saveJob(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Job not found');
    try {
      return await this.savedJobModel.create({
        userId: new Types.ObjectId(userId),
        jobId: new Types.ObjectId(jobId),
      });
    } catch {
      throw new ConflictException('Job already saved');
    }
  }

  async unsaveJob(userId: string, jobId: string) {
    await this.savedJobModel.deleteOne({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });
    return { message: 'Removed' };
  }

  async listSaved(userId: string) {
    const saved = await this.savedJobModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    const jobs = await Promise.all(
      saved.map(async (s) => {
        const job = await this.jobsRepository.findById(s.jobId.toString());
        return {
          savedAt: (s as SavedJobDocument & { createdAt?: Date }).createdAt,
          job,
        };
      }),
    );
    return jobs.filter((j) => j.job);
  }

  async listAlertSubscribers() {
    return this.profileModel.find({ 'jobAlertPrefs.enabled': true }).exec();
  }
}
