import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from '../../billing/services/billing.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UsersService } from '../../users/services/users.service';
import { TrackReferralDto } from '../dto/referral.dto';

const MOCK_REFERRAL_BONUS = 5;

@Injectable()
export class ReferralsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly config: ConfigService,
  ) {}

  async getMine(userId: string) {
    const user = await this.usersService.ensureReferralCode(userId);
    const frontendUrl =
      this.config.get<string>('frontendUrl') || 'http://localhost:3000';

    return {
      code: user.referralCode,
      link: `${frontendUrl}/register?ref=${user.referralCode}`,
      clicks: user.referralClicks || 0,
      registrations: user.referralRegistrations || 0,
      earnings: user.referralEarnings || 0,
      leaderboard: [
        {
          code: user.referralCode || 'YOU',
          registrations: user.referralRegistrations || 0,
        },
      ],
    };
  }

  async track(dto: TrackReferralDto) {
    const referrer = await this.usersRepository.findByReferralCode(dto.code);
    if (!referrer) throw new NotFoundException('Referral code not found');

    if (dto.event === 'click') {
      await this.usersRepository.updateById(referrer._id.toString(), {
        referralClicks: (referrer.referralClicks || 0) + 1,
      });
    } else {
      await this.usersRepository.updateById(referrer._id.toString(), {
        referralRegistrations: (referrer.referralRegistrations || 0) + 1,
      });
    }

    return { message: 'Tracked' };
  }

  /** Mock credit: pays out a fixed referral bonus into the seeker's wallet. */
  async creditMock(userId: string) {
    const { wallet } = await this.billingService.creditWallet(
      userId,
      MOCK_REFERRAL_BONUS,
      'REFERRAL_CREDIT',
      { reason: 'referral-bonus' },
    );

    const user = await this.usersRepository.findById(userId);
    await this.usersRepository.updateById(userId, {
      referralEarnings: (user?.referralEarnings || 0) + MOCK_REFERRAL_BONUS,
    });

    return {
      message: 'Referral bonus credited',
      amount: MOCK_REFERRAL_BONUS,
      wallet,
    };
  }
}
