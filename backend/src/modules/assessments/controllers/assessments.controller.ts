import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { AssessmentsService } from '../services/assessments.service';

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'List assessments' })
  list(@CurrentUser() user: JwtPayload) {
    return this.assessmentsService.list(user.sub, user.role);
  }

  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return this.assessmentsService.create(user.sub, user.role, body);
  }

  @Post(':id/send')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  send(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { applicationId: string },
  ) {
    return this.assessmentsService.send(
      user.sub,
      user.role,
      id,
      body.applicationId,
    );
  }
}
