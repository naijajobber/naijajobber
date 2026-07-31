import { ConflictException } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';
import { EmployersService } from '../../employers/services/employers.service';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repo: jest.Mocked<CompaniesRepository>;
  let employers: jest.Mocked<EmployersService>;

  beforeEach(() => {
    repo = {
      findBySlug: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<CompaniesRepository>;

    employers = {
      ensureEmployerRole: jest.fn(),
      upsertMe: jest.fn(),
      getMe: jest.fn(),
      linkCompany: jest.fn(),
    } as unknown as jest.Mocked<EmployersService>;

    service = new CompaniesService(repo, employers, {
      saveFile: jest.fn(),
    } as never);
  });

  it('creates company and links employer', async () => {
    employers.getMe.mockResolvedValue({ companyId: null } as never);
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      _id: { toString: () => 'c1' },
      name: 'Acme',
      slug: 'acme-x',
    } as never);

    const company = await service.create(
      '507f1f77bcf86cd799439011',
      Role.EMPLOYER,
      {
        name: 'Acme',
      },
    );

    expect(employers.linkCompany).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'c1',
    );
    expect(company.name).toBe('Acme');
  });

  it('blocks second company for same employer', async () => {
    employers.getMe.mockResolvedValue({
      companyId: { toString: () => 'existing' },
    } as never);

    await expect(
      service.create('u1', Role.EMPLOYER, { name: 'Other' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
