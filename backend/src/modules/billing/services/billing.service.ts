import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Role } from '../../../common/enums/role.enum';
import { PaymentRouterService } from '../../../infrastructure/payments/payment-router.service';
import { EmployersService } from '../../employers/services/employers.service';
import { JobsRepository } from '../../jobs/repositories/jobs.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import {
  CreateCheckoutDto,
  CreateCouponDto,
  CreateRefundDto,
  ReviewRefundDto,
} from '../dto/billing.dto';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../schemas/plan.schema';
import { RefundRequest, RefundRequestDocument } from '../schemas/refund.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../schemas/subscription.schema';
import {
  Transaction,
  TransactionDocument,
} from '../schemas/transaction.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    @InjectModel(RefundRequest.name)
    private readonly refundModel: Model<RefundRequestDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly paymentRouter: PaymentRouterService,
    @Inject(forwardRef(() => EmployersService))
    private readonly employersService: EmployersService,
    private readonly usersRepository: UsersRepository,
    private readonly jobsRepository: JobsRepository,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const seeds: Partial<SubscriptionPlan>[] = [
      {
        code: 'STARTER',
        name: 'Starter',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: ['basic_posting'],
        isActive: true,
        isOneOff: false,
      },
      {
        code: 'EMPLOYER_PRO',
        name: 'Employer Pro',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: ['basic_posting', 'featured_jobs', 'analytics'],
        isActive: true,
        isOneOff: false,
      },
      {
        code: 'FEATURED_JOB',
        name: 'Featured Job Boost',
        price: 49,
        currency: 'USD',
        interval: 'one_time',
        features: ['featured_job'],
        isActive: true,
        isOneOff: true,
      },
    ];
    for (const seed of seeds) {
      await this.planModel.updateOne(
        { code: seed.code },
        { $setOnInsert: seed },
        { upsert: true },
      );
    }
  }

  listPlans() {
    return this.planModel.find({ isActive: true }).exec();
  }

  private readonly walletTransactionPurposes = [
    'WALLET_CREDIT',
    'WALLET_WITHDRAW',
    'REFERRAL_CREDIT',
  ];

  async getWallet(userId: string) {
    let wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!wallet) {
      wallet = await this.walletModel.create({
        userId: new Types.ObjectId(userId),
        balance: 0,
        pendingBalance: 0,
      });
    }
    return wallet;
  }

  async getWalletTransactions(userId: string) {
    return this.transactionModel
      .find({
        userId: new Types.ObjectId(userId),
        purpose: { $in: this.walletTransactionPurposes },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Credits the user's wallet immediately (mock ledger entry, always SUCCESS). */
  async creditWallet(
    userId: string,
    amount: number,
    purpose: 'WALLET_CREDIT' | 'REFERRAL_CREDIT' = 'WALLET_CREDIT',
    metadata: Record<string, unknown> = {},
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    const wallet = await this.getWallet(userId);
    const reference = `wc_${Date.now()}_${randomBytes(4).toString('hex')}`;

    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      amount,
      currency: wallet.currency,
      provider: 'mock',
      reference,
      status: 'SUCCESS',
      purpose,
      metadata,
    });

    wallet.balance += amount;
    await wallet.save();

    return { wallet, transaction };
  }

  /** Mock withdrawal: creates a PENDING ledger entry, then auto-completes to SUCCESS and decrements the balance. */
  async withdrawFromWallet(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    const wallet = await this.getWallet(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const reference = `wd_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      amount,
      currency: wallet.currency,
      provider: 'mock',
      reference,
      status: 'PENDING',
      purpose: 'WALLET_WITHDRAW',
    });

    wallet.balance -= amount;
    await wallet.save();

    transaction.status = 'SUCCESS';
    await transaction.save();

    return { wallet, transaction };
  }

  async validateCoupon(code: string) {
    const coupon = await this.couponModel
      .findOne({ code: code.toUpperCase(), isActive: true })
      .exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon expired');
    }
    if (coupon.redemptionCount >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon fully redeemed');
    }
    return coupon;
  }

  async createCoupon(dto: CreateCouponDto) {
    return this.couponModel.create({
      code: dto.code.toUpperCase(),
      percentOff: dto.percentOff ?? null,
      amountOff: dto.amountOff ?? null,
    });
  }

  async checkout(userId: string, role: string, dto: CreateCheckoutDto) {
    this.employersService.ensureEmployerRole(role);
    const employer = await this.employersService.getMe(userId, role);
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let amount = 0;
    let currency = 'USD';
    let planCode = dto.planCode;

    if (dto.purpose === 'SUBSCRIPTION') {
      const plan = await this.planModel
        .findOne({ code: (dto.planCode || 'EMPLOYER_PRO').toUpperCase() })
        .exec();
      if (!plan) throw new NotFoundException('Plan not found');
      amount = plan.price;
      currency = plan.currency;
      planCode = plan.code;
    } else {
      const plan = await this.planModel.findOne({ code: 'FEATURED_JOB' }).exec();
      amount = plan?.price || 49;
      currency = plan?.currency || 'USD';
      if (!dto.jobId) throw new BadRequestException('jobId required');
    }

    if (dto.couponCode) {
      const coupon = await this.validateCoupon(dto.couponCode);
      if (coupon.percentOff) {
        amount = Math.max(0, amount * (1 - coupon.percentOff / 100));
      } else if (coupon.amountOff) {
        amount = Math.max(0, amount - coupon.amountOff);
      }
      await this.couponModel.updateOne(
        { _id: coupon._id },
        { $inc: { redemptionCount: 1 } },
      );
    }

    const reference = `nj_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const provider = this.paymentRouter.resolve(dto.provider);
    const frontend =
      this.config.get<string>('frontendUrl') || 'http://localhost:3000';

    await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      companyId: employer.companyId,
      amount,
      currency,
      provider: provider.name,
      reference,
      status: 'PENDING',
      purpose: dto.purpose,
      metadata: {
        planCode,
        jobId: dto.jobId,
      },
    });

    const checkout = await provider.createCheckout({
      purpose: dto.purpose,
      amount,
      currency,
      reference,
      customerEmail: user.email,
      planCode,
      successUrl: `${frontend}/billing/success`,
      cancelUrl: `${frontend}/dashboard/employer/billing`,
      metadata: { userId, purpose: dto.purpose },
    });

    // Mock mode: auto-complete immediately for local DX
    if (provider.name === 'mock' || this.config.get('payment.mode') === 'mock') {
      await this.completePayment(reference);
    }

    return checkout;
  }

  async completePayment(reference: string) {
    const tx = await this.transactionModel.findOne({ reference }).exec();
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.status === 'SUCCESS') return tx;

    tx.status = 'SUCCESS';
    await tx.save();

    if (tx.purpose === 'SUBSCRIPTION') {
      const planCode = String(tx.metadata?.planCode || 'EMPLOYER_PRO');
      await this.subscriptionModel.findOneAndUpdate(
        { userId: tx.userId, companyId: tx.companyId },
        {
          userId: tx.userId,
          companyId: tx.companyId,
          planCode,
          status: 'ACTIVE',
          provider: tx.provider,
          providerSubscriptionId: `sub_${reference}`,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { upsert: true, returnDocument: 'after' },
      );
    }

    if (
      (tx.purpose === 'FEATURED_JOB' || tx.purpose === 'SPONSORED_JOB') &&
      tx.metadata?.jobId
    ) {
      await this.jobsRepository.updateById(String(tx.metadata.jobId), {
        isFeatured: true,
        isUrgent: tx.purpose === 'SPONSORED_JOB' ? true : undefined,
      } as never);
    }

    const count = await this.invoiceModel.countDocuments();
    await this.invoiceModel.create({
      number: `INV-${String(count + 1).padStart(5, '0')}`,
      userId: tx.userId,
      transactionId: tx._id,
      lineItems: [
        { description: tx.purpose, amount: tx.amount },
      ],
      total: tx.amount,
      currency: tx.currency,
      pdfUrl: '',
    });

    return tx;
  }

  async handleWebhook(
    providerName: string,
    headers: Record<string, string | string[] | undefined>,
    body: Record<string, unknown>,
  ) {
    const provider = this.paymentRouter.byName(providerName);
    const result = await provider.verifyWebhook(headers, body);
    if (result.status === 'success' && result.reference) {
      await this.completePayment(result.reference);
    }
    return { message: 'OK', ...result };
  }

  async mySubscription(userId: string, role: string) {
    this.employersService.ensureEmployerRole(role);
    const employer = await this.employersService.getMe(userId, role);
    return this.subscriptionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        ...(employer.companyId
          ? { companyId: employer.companyId }
          : {}),
        status: 'ACTIVE',
      })
      .exec();
  }

  async cancelSubscription(userId: string, role: string) {
    const sub = await this.mySubscription(userId, role);
    if (!sub) throw new NotFoundException('No active subscription');
    sub.status = 'CANCELLED';
    await sub.save();
    return sub;
  }

  async listInvoices(userId: string) {
    return this.invoiceModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async listTransactions(userId: string) {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async requestRefund(userId: string, dto: CreateRefundDto) {
    const tx = await this.transactionModel.findById(dto.transactionId).exec();
    if (!tx || tx.userId.toString() !== userId) {
      throw new NotFoundException('Transaction not found');
    }
    return this.refundModel.create({
      transactionId: tx._id,
      userId: new Types.ObjectId(userId),
      reason: dto.reason,
      status: 'PENDING',
    });
  }

  async reviewRefund(id: string, dto: ReviewRefundDto) {
    const refund = await this.refundModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { returnDocument: 'after' },
    );
    if (!refund) throw new NotFoundException('Refund request not found');
    return refund;
  }

  /** Entitlement: featured/sponsored posting */
  async canFeatureJobs(userId: string, companyId: string | null): Promise<boolean> {
    const sub = await this.subscriptionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        ...(companyId ? { companyId: new Types.ObjectId(companyId) } : {}),
        status: 'ACTIVE',
        planCode: { $in: ['EMPLOYER_PRO'] },
      })
      .exec();
    return !!sub;
  }

  async assertFeaturedAllowed(
    userId: string,
    companyId: string,
    jobId: string,
  ): Promise<void> {
    if (await this.canFeatureJobs(userId, companyId)) return;
    const paid = await this.transactionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: 'SUCCESS',
        purpose: { $in: ['FEATURED_JOB', 'SPONSORED_JOB'] },
        'metadata.jobId': jobId,
      })
      .exec();
    if (!paid) {
      throw new BadRequestException(
        'Featured/sponsored jobs require Employer Pro or a featured job payment',
      );
    }
  }
}
