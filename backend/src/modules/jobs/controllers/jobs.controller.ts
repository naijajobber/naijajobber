import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { CreateJobDto, SearchJobsDto, UpdateJobDto } from '../dto/job.dto';
import { JobsService } from '../services/jobs.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search published jobs' })
  search(@Query() query: SearchJobsDto) {
    return this.jobsService.search(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'List my company jobs' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.jobsService.mine(user.sub, user.role);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get published job by slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.jobsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Create job draft' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update job' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/publish')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Publish job (verified company only)' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.publish(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/duplicate')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Duplicate a job as draft' })
  duplicate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.duplicate(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/archive')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Archive a job' })
  archive(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.archive(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/pause')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Pause a published job' })
  pause(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.pause(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/unpause')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Unpause a job' })
  unpause(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.unpause(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/close')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Close job' })
  close(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.close(id, user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete job' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.jobsService.softDelete(id, user.sub, user.role);
    return { message: 'Job deleted' };
  }
}
