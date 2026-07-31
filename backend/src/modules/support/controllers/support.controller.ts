import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { SupportService } from '../services/support.service';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'List my support tickets' })
  list(@CurrentUser() user: JwtPayload) {
    return this.supportService.list(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.supportService.create(user.sub, user.role, body);
  }
}
