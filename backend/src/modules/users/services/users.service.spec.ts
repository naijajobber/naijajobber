import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../common/enums/role.enum';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue({ _id: { toString: () => '1' } }),
      create: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    service = new UsersService(repository, config);
  });

  it('returns profile when user exists', async () => {
    repository.findById.mockResolvedValue({
      email: 'ada@example.com',
      role: Role.JOB_SEEKER,
    } as never);

    const profile = await service.getProfile('user-1');
    expect(profile.email).toBe('ada@example.com');
  });

  it('throws when user is missing', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates profile fields', async () => {
    repository.updateById.mockResolvedValue({
      headline: 'Engineer',
    } as never);

    const updated = await service.updateProfile('user-1', {
      headline: 'Engineer',
    });
    expect(updated.headline).toBe('Engineer');
  });
});
