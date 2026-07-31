import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { OffersService } from '../services/offers.service';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'List offers' })
  list(@CurrentUser() user: JwtPayload) {
    return this.offersService.list(user.sub, user.role);
  }

  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.offersService.create(user.sub, user.role, body);
  }

  @Post(':id/accept')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Accept an offer (seeker)' })
  accept(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.offersService.accept(user.sub, id);
  }
}
