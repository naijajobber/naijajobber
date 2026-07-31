import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Types } from 'mongoose';
import {
  CompanyRole,
  CompanyVerificationStatus,
  InviteStatus,
} from '../../../common/enums/domain.enum';
import { Role } from '../../../common/enums/role.enum';
import { uniqueSlug } from '../../../common/utils/slug.util';
import { UploadService } from '../../../infrastructure/uploads/upload.service';
import { EmployersService } from '../../employers/services/employers.service';
import {
  CreateCompanyDto,
  RegisterWebhookDto,
  UpdateCompanyDto,
} from '../dto/company.dto';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompanyDocument } from '../schemas/company.schema';

@Injectable()
export class CompaniesService implements OnModuleInit {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly employersService: EmployersService,
    private readonly uploadService: UploadService,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing =
      await this.companiesRepository.findBySlug('novahire-africa');
    if (existing) return;

    await this.companiesRepository.create({
      name: 'NovaHire Africa',
      slug: 'novahire-africa',
      website: 'https://novahire.example',
      description:
        'Demo verified employer used for local seed jobs on NaijaJobber.',
      size: '51-200',
      industry: 'Technology',
      verificationStatus: CompanyVerificationStatus.VERIFIED,
      createdByUserId: new Types.ObjectId(),
    });
  }

  async create(
    userId: string,
    role: string,
    dto: CreateCompanyDto,
  ): Promise<CompanyDocument> {
    this.employersService.ensureEmployerRole(role);
    await this.employersService.upsertMe(userId, role, {});

    const employer = await this.employersService.getMe(userId, role);
    if (employer.companyId) {
      throw new ConflictException('You already belong to a company');
    }

    let slug = uniqueSlug(dto.name);
    while (await this.companiesRepository.findBySlug(slug)) {
      slug = uniqueSlug(dto.name);
    }

    const company = await this.companiesRepository.create({
      ...this.mapCompanyFields(dto),
      name: dto.name,
      slug,
      verificationStatus: CompanyVerificationStatus.PENDING,
      createdByUserId: new Types.ObjectId(userId),
    });

    await this.employersService.linkCompany(userId, company._id.toString(), {
      companyRole: CompanyRole.OWNER,
      inviteStatus: InviteStatus.ACTIVE,
    });
    return company;
  }

  async findBySlug(slug: string): Promise<CompanyDocument> {
    const company = await this.companiesRepository.findBySlug(slug);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findByIdOrFail(id: string): Promise<CompanyDocument> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async getMine(userId: string, role: string): Promise<CompanyDocument | null> {
    this.employersService.ensureEmployerRole(role);
    const employer = await this.employersService.getMe(userId, role);
    if (!employer.companyId) return null;
    return this.companiesRepository.findById(employer.companyId.toString());
  }

  async update(
    id: string,
    userId: string,
    role: string,
    dto: UpdateCompanyDto,
  ): Promise<CompanyDocument> {
    const company = await this.findByIdOrFail(id);
    const isAdmin =
      role === Role.SUPER_ADMIN ||
      role === Role.ADMIN ||
      role === Role.MODERATOR;

    if (!isAdmin) {
      this.employersService.ensureEmployerRole(role);
      const employer = await this.employersService.getMe(userId, role);
      if (
        !employer.companyId ||
        employer.companyId.toString() !== company._id.toString()
      ) {
        throw new ForbiddenException('Not allowed to update this company');
      }
      if (employer.companyRole === 'VIEWER') {
        throw new ForbiddenException('Viewers cannot update company');
      }
    }

    const updated = await this.companiesRepository.updateById(
      id,
      this.mapCompanyFields(dto),
    );
    if (!updated) {
      throw new NotFoundException('Company not found');
    }
    return updated;
  }

  async verify(id: string): Promise<CompanyDocument> {
    const updated = await this.companiesRepository.updateById(id, {
      verificationStatus: CompanyVerificationStatus.VERIFIED,
      rejectionReason: '',
    });
    if (!updated) {
      throw new NotFoundException('Company not found');
    }
    return updated;
  }

  async reject(id: string, reason: string): Promise<CompanyDocument> {
    const updated = await this.companiesRepository.updateById(id, {
      verificationStatus: CompanyVerificationStatus.REJECTED,
      rejectionReason: reason || '',
    });
    if (!updated) {
      throw new NotFoundException('Company not found');
    }
    return updated;
  }

  async addVerificationDocument(
    userId: string,
    role: string,
    type: string,
    file: Express.Multer.File,
  ) {
    const company = await this.requireMine(userId, role);
    if (!file) throw new BadRequestException('File required');
    if (!type?.trim()) throw new BadRequestException('Document type required');
    const saved = await this.uploadService.saveFile(file);
    const docs = [
      ...(company.verificationDocuments || []),
      { type: type.trim(), fileUrl: saved.url, uploadedAt: new Date() },
    ];
    const updated = await this.companiesRepository.updateById(
      company._id.toString(),
      {
        verificationDocuments: docs,
        verificationStatus: CompanyVerificationStatus.PENDING,
      },
    );
    return updated;
  }

  async resubmitVerification(userId: string, role: string) {
    const company = await this.requireMine(userId, role);
    const updated = await this.companiesRepository.updateById(
      company._id.toString(),
      {
        verificationStatus: CompanyVerificationStatus.PENDING,
        rejectionReason: '',
      },
    );
    return updated;
  }

  async generateApiKey(userId: string, role: string, label?: string) {
    const company = await this.requireMine(userId, role);
    const raw = `nj_${randomBytes(24).toString('hex')}`;
    const keyHash = createHash('sha256').update(raw).digest('hex');
    const entry = {
      keyHash,
      label: label || 'default',
      createdAt: new Date(),
      lastUsedAt: null,
      revokedAt: null,
      prefix: raw.slice(0, 10),
    };
    const apiKeys = [...(company.apiKeys || []), entry];
    await this.companiesRepository.updateById(company._id.toString(), {
      apiKeys,
    });
    return {
      apiKey: raw,
      label: entry.label,
      prefix: entry.prefix,
      message: 'Store this key now — it will not be shown again',
    };
  }

  async revokeApiKey(userId: string, role: string, prefix: string) {
    const company = await this.requireMine(userId, role);
    const apiKeys = (company.apiKeys || []).map((k) =>
      k.prefix === prefix || k.keyHash.startsWith(prefix)
        ? { ...k, revokedAt: new Date() }
        : k,
    );
    await this.companiesRepository.updateById(company._id.toString(), {
      apiKeys,
    });
    return { message: 'Revoked' };
  }

  async registerWebhook(userId: string, role: string, dto: RegisterWebhookDto) {
    const company = await this.requireMine(userId, role);
    const webhooks = [
      ...(company.webhooks || []),
      {
        url: dto.url,
        events: dto.events || ['application.created', 'interview.scheduled'],
        createdAt: new Date(),
      },
    ];
    await this.companiesRepository.updateById(company._id.toString(), {
      webhooks,
    });
    return { webhooks };
  }

  async updateIntegrations(
    userId: string,
    role: string,
    flags: Record<string, boolean>,
  ) {
    const company = await this.requireMine(userId, role);
    const integrations = { ...(company.integrations as object), ...flags };
    const updated = await this.companiesRepository.updateById(
      company._id.toString(),
      { integrations: integrations as never },
    );
    return updated;
  }

  private async requireMine(userId: string, role: string) {
    const company = await this.getMine(userId, role);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  private mapCompanyFields(dto: CreateCompanyDto | UpdateCompanyDto) {
    const out: Record<string, unknown> = {};
    const keys = [
      'website',
      'logoUrl',
      'coverBannerUrl',
      'description',
      'size',
      'industry',
      'email',
      'phone',
      'headquarters',
      'officeLocations',
      'yearFounded',
      'mission',
      'vision',
      'coreValues',
      'socialLinks',
      'culturePhotos',
      'officeImages',
      'videoUrls',
      'branding',
      'careerPage',
      'integrations',
      'name',
    ] as const;
    for (const k of keys) {
      if ((dto as Record<string, unknown>)[k] !== undefined) {
        out[k] = (dto as Record<string, unknown>)[k];
      }
    }
    return out;
  }
}
