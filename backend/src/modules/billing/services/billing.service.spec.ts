import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockPaymentProvider } from '../../../infrastructure/payments/mock.provider';
import { PaymentRouterService } from '../../../infrastructure/payments/payment-router.service';
import { EmployersService } from '../../employers/services/employers.service';
import { JobsRepository } from '../../jobs/repositories/jobs.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let couponModel: {
    findOne: jest.Mock;
  };
  let subscriptionModel: {
    findOne: jest.Mock;
  };
  let transactionModel: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    couponModel = {
      findOne: jest.fn(),
    };
    subscriptionModel = {
      findOne: jest.fn(),
    };
    transactionModel = {
      findOne: jest.fn(),
    };

    const chain = (result: unknown) => ({
      exec: jest.fn().mockResolvedValue(result),
    });

    couponModel.findOne.mockImplementation(() => chain(null));
    subscriptionModel.findOne.mockImplementation(() => chain(null));
    transactionModel.findOne.mockImplementation(() => chain(null));

    service = new BillingService(
      {} as never,
      subscriptionModel as never,
      transactionModel as never,
      {} as never,
      couponModel as never,
      {} as never,
      {} as never,
      {} as PaymentRouterService,
      {} as EmployersService,
      {} as UsersRepository,
      {} as JobsRepository,
      {} as ConfigService,
    );
  });

  describe('validateCoupon', () => {
    it('rejects unknown coupons', async () => {
      await expect(service.validateCoupon('MISS')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects expired coupons', async () => {
      couponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          code: 'OLD',
          expiresAt: new Date(Date.now() - 1000),
          redemptionCount: 0,
          maxRedemptions: 10,
        }),
      });
      await expect(service.validateCoupon('OLD')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('accepts valid coupons', async () => {
      const coupon = {
        code: 'SAVE10',
        expiresAt: new Date(Date.now() + 86400000),
        redemptionCount: 1,
        maxRedemptions: 10,
        percentOff: 10,
      };
      couponModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(coupon),
      });
      await expect(service.validateCoupon('save10')).resolves.toEqual(coupon);
    });
  });

  describe('assertFeaturedAllowed', () => {
    it('allows active Employer Pro', async () => {
      subscriptionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ planCode: 'EMPLOYER_PRO' }),
      });
      await expect(
        service.assertFeaturedAllowed(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
          '507f1f77bcf86cd799439013',
        ),
      ).resolves.toBeUndefined();
    });

    it('allows paid featured transaction for job', async () => {
      subscriptionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      transactionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
      });
      await expect(
        service.assertFeaturedAllowed(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
          '507f1f77bcf86cd799439013',
        ),
      ).resolves.toBeUndefined();
    });

    it('blocks featured without entitlement', async () => {
      subscriptionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      transactionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.assertFeaturedAllowed(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
          '507f1f77bcf86cd799439013',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});

describe('MockPaymentProvider webhook', () => {
  it('accepts mock webhook payload', async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.verifyWebhook(
      {},
      { reference: 'nj_test_ref', status: 'success' },
    );
    expect(result.reference).toBe('nj_test_ref');
    expect(result.status).toBe('success');
    expect(result.provider).toBe('mock');
  });
});
