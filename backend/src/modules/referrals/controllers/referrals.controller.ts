import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { TrackReferralDto } from '../dto/referral.dto';
import { ReferralsService } from '../services/referrals.service';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get my referral code, link, and stats' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.referralsService.getMine(user.sub);
  }

  @Public()
  @Post('track')
  @ApiOperation({ summary: 'Track a referral click or registration event' })
  track(@Body() dto: TrackReferralDto) {
    return this.referralsService.track(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('credit-mock')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Mock-credit a referral bonus into my wallet' })
  creditMock(@CurrentUser() user: JwtPayload) {
    return this.referralsService.creditMock(user.sub);
  }
}
