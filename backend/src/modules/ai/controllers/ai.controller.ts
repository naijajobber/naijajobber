import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { CoverLetterDto, JobMatchDto, ResumeReviewDto } from '../dto/ai.dto';
import { AiService } from '../services/ai.service';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('runs')
  @ApiOperation({ summary: 'List recent AI runs for current user' })
  listRuns(@CurrentUser() user: JwtPayload) {
    return this.aiService.listRuns(user.sub);
  }

  @Post('resume/review')
  @Roles(Role.JOB_SEEKER, Role.EMPLOYER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'AI resume review' })
  review(@CurrentUser() user: JwtPayload, @Body() dto: ResumeReviewDto) {
    return this.aiService.reviewResume(user.sub, dto);
  }

  @Post('cover-letter')
  @Roles(Role.JOB_SEEKER, Role.EMPLOYER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate cover letter draft' })
  cover(@CurrentUser() user: JwtPayload, @Body() dto: CoverLetterDto) {
    return this.aiService.coverLetter(user.sub, dto);
  }

  @Post('match')
  @Roles(Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Match seeker profile to published jobs' })
  match(@CurrentUser() user: JwtPayload, @Body() dto: JobMatchDto) {
    return this.aiService.matchJobs(user.sub, dto);
  }

  @Post('resume/parse')
  @Roles(Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mock resume parser — extract profile fields' })
  parse(
    @CurrentUser() user: JwtPayload,
    @Body() body: { resumeText?: string; resumeUrl?: string; fileName?: string },
  ) {
    return this.aiService.parseResume(user.sub, body);
  }

  @Post('candidates/match')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mock AI rank applicants for a job' })
  matchCandidates(
    @CurrentUser() user: JwtPayload,
    @Body() body: { jobId: string },
  ) {
    return this.aiService.matchCandidates(user.sub, user.role, body.jobId);
  }
}
