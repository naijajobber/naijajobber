import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';
import { EmployersService } from './employers.service';

describe('EmployersService', () => {
  let service: EmployersService;

  beforeEach(() => {
    service = new EmployersService(
      {
        findByUserId: jest.fn(),
        create: jest.fn(),
        updateById: jest.fn(),
        updateByUserId: jest.fn(),
        findAll: jest.fn(),
        findByCompanyId: jest.fn(),
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('rejects non-employer roles', () => {
    expect(() => service.ensureEmployerRole(Role.JOB_SEEKER)).toThrow(
      ForbiddenException,
    );
  });
});
