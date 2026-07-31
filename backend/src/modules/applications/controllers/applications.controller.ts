import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto';
import { ApplicationsService } from '../services/applications.service';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('applications')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Apply to a job' })
  apply(@CurrentUser() user: JwtPayload, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.apply(user.sub, user.role, dto);
  }

  @Get('applications/mine')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'List my applications' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.mine(user.sub);
  }

  @Get('applications/company')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all applications for my company' })
  companyApps(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.listForCompany(user.sub, user.role);
  }

  @Post('applications/bulk-status')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk update application statuses' })
  bulkStatus(
    @CurrentUser() user: JwtPayload,
    @Body() body: { ids: string[]; status: string; note?: string },
  ) {
    return this.applicationsService.bulkUpdateStatus(user.sub, user.role, {
      ids: body.ids,
      status: body.status as never,
      note: body.note,
    });
  }

  @Post('applications/:id/withdraw')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Withdraw application' })
  withdraw(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.applicationsService.withdraw(id, user.sub);
  }

  @Get('jobs/:jobId/applications')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List applications for a job' })
  listForJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.applicationsService.listForJob(jobId, user.sub, user.role);
  }

  @Patch('applications/:id/status')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update application status' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(
      id,
      user.sub,
      user.role,
      dto,
    );
  }
}
