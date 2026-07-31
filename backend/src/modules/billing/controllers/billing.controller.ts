import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  CreateCheckoutDto,
  CreateCouponDto,
  CreateRefundDto,
  ReviewRefundDto,
  ValidateCouponDto,
  WithdrawWalletDto,
} from '../dto/billing.dto';
import { BillingService } from '../services/billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List subscription plans' })
  plans() {
    return this.billingService.listPlans();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('checkout')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Create checkout session' })
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CreateCheckoutDto) {
    return this.billingService.checkout(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('subscriptions/mine')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  mySubscription(@CurrentUser() user: JwtPayload) {
    return this.billingService.mySubscription(user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('subscriptions/cancel')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  cancel(@CurrentUser() user: JwtPayload) {
    return this.billingService.cancelSubscription(user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('invoices')
  invoices(@CurrentUser() user: JwtPayload) {
    return this.billingService.listInvoices(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('transactions')
  transactions(@CurrentUser() user: JwtPayload) {
    return this.billingService.listTransactions(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('wallet')
  wallet(@CurrentUser() user: JwtPayload) {
    return this.billingService.getWallet(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('wallet/transactions')
  @ApiOperation({ summary: 'List wallet ledger entries (credits/withdrawals)' })
  walletTransactions(@CurrentUser() user: JwtPayload) {
    return this.billingService.getWalletTransactions(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('wallet/withdraw')
  @ApiOperation({ summary: 'Mock wallet withdrawal (auto-completes)' })
  withdrawWallet(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WithdrawWalletDto,
  ) {
    return this.billingService.withdrawFromWallet(user.sub, dto.amount);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('coupons/validate')
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.billingService.validateCoupon(dto.code);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('coupons')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.billingService.createCoupon(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('refunds')
  requestRefund(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRefundDto,
  ) {
    return this.billingService.requestRefund(user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('refunds/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  reviewRefund(@Param('id') id: string, @Body() dto: ReviewRefundDto) {
    return this.billingService.reviewRefund(id, dto);
  }

  @Public()
  @Post('webhooks/:provider')
  @HttpCode(200)
  @ApiOperation({ summary: 'Payment provider webhook' })
  webhook(
    @Param('provider') provider: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.billingService.handleWebhook(provider, headers, body);
  }
}
