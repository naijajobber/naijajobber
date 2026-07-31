import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';
import { ProfilesService } from './profiles.service';

describe('ProfilesService visibility', () => {
  let service: ProfilesService;
  let profileModel: { findOne: jest.Mock };

  beforeEach(() => {
    profileModel = {
      findOne: jest.fn(),
    };
    service = new ProfilesService(
      profileModel as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { get: () => 'http://localhost:3001' } as never,
    );
  });

  it('allows public profiles to anyone', async () => {
    profileModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        visibility: 'PUBLIC',
        userId: { toString: () => 'u1' },
      }),
    });
    await expect(
      service.getByUserId(null, null, '507f1f77bcf86cd799439011'),
    ).resolves.toBeTruthy();
  });

  it('blocks private profiles for strangers', async () => {
    profileModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        visibility: 'PRIVATE',
        userId: { toString: () => 'u1' },
      }),
    });
    await expect(
      service.getByUserId(
        '507f1f77bcf86cd799439099',
        Role.JOB_SEEKER,
        '507f1f77bcf86cd799439011',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
