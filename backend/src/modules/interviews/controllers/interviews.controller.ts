import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { CreateInterviewDto, UpdateInterviewDto } from '../dto/interview.dto';
import { InterviewsService } from '../services/interviews.service';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get('mine')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'List my scheduled interviews' })
  mine(@CurrentUser() user: JwtPayload) {
    return this.interviewsService.mine(user.sub);
  }

  @Get('employer')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List interviews I scheduled as an employer' })
  employer(@CurrentUser() user: JwtPayload) {
    return this.interviewsService.forEmployer(user.sub);
  }

  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Schedule an interview for an application' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(user.sub, dto);
  }

  @Patch(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update/reschedule/cancel an interview' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(id, user.sub, user.role, dto);
  }
}
