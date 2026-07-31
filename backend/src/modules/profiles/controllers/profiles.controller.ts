import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  ToggleLearningBookmarkDto,
  UpdateJobAlertPrefsDto,
  UpdateSeekerProfileDto,
  UpdateSettingsDto,
} from '../dto/profile.dto';
import { ProfilesService } from '../services/profiles.service';
import { JobAlertsService } from '../services/job-alerts.service';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly jobAlertsService: JobAlertsService,
  ) {}

  @Get('profiles/me')
  @Roles(Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get or create my seeker profile' })
  me(@CurrentUser() user: JwtPayload) {
    return this.profilesService.getOrCreateMe(user.sub);
  }

  @Patch('profiles/me')
  @Roles(Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN)
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSeekerProfileDto) {
    return this.profilesService.updateMe(user.sub, dto);
  }

  @Post('profiles/me/cv/upload')
  @Roles(Role.JOB_SEEKER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  uploadCv(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadCv(user.sub, file);
  }

  @Post('profiles/me/cv/primary')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Set primary CV URL from uploaded cvFiles' })
  setPrimary(
    @CurrentUser() user: JwtPayload,
    @Body() body: { url: string },
  ) {
    return this.profilesService.setPrimaryCv(user.sub, body.url);
  }

  @Delete('profiles/me/cv')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Delete a CV from cvFiles' })
  deleteCv(@CurrentUser() user: JwtPayload, @Body() body: { url: string }) {
    return this.profilesService.deleteCv(user.sub, body.url);
  }

  @Post('profiles/me/cv/replace')
  @Roles(Role.JOB_SEEKER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  replaceCv(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { url: string },
  ) {
    return this.profilesService.replaceCv(user.sub, body.url, file);
  }

  @Post('profiles/me/cv/parse-apply')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Merge mock-parsed resume fields into profile' })
  parseApply(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      skills?: string[];
      experience?: Array<Record<string, string>>;
      education?: Array<Record<string, string>>;
      certificates?: Array<Record<string, string>>;
      email?: string;
      phone?: string;
      name?: string;
    },
  ) {
    return this.profilesService.applyParsedResume(user.sub, body);
  }

  @Post('profiles/me/cv/generate')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Generate HTML CV from profile and save under /uploads' })
  generateCv(
    @CurrentUser() user: JwtPayload,
    @Body() body?: { template?: string },
  ) {
    return this.profilesService.generateCvDocument(
      user.sub,
      body?.template || 'professional',
    );
  }

  @Get('profiles/me/insights')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Lightweight seeker insights snapshot' })
  insights(@CurrentUser() user: JwtPayload) {
    return this.profilesService.getInsights(user.sub);
  }

  @Post('profiles/me/cv/generate-pdf')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({
    summary: 'Deprecated alias — generates HTML CV (same as /cv/generate)',
  })
  generateCvLegacy(@CurrentUser() user: JwtPayload) {
    return this.profilesService.generateCvDocument(user.sub);
  }

  @Patch('profiles/me/alerts')
  @Roles(Role.JOB_SEEKER)
  alerts(@CurrentUser() user: JwtPayload, @Body() dto: UpdateJobAlertPrefsDto) {
    return this.profilesService.updateAlertPrefs(user.sub, dto);
  }

  @Post('profiles/me/learning/bookmarks')
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({ summary: 'Toggle a learning item bookmark' })
  toggleLearningBookmark(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ToggleLearningBookmarkDto,
  ) {
    return this.profilesService.toggleLearningBookmark(user.sub, dto.itemId);
  }

  @Post('profiles/alerts/run-digest')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Queue or run job-alert digest (admin)' })
  runDigest() {
    return this.jobAlertsService.enqueueDigest();
  }

  @Get('profiles/:userId')
  @Public()
  @ApiOperation({ summary: 'View seeker profile (visibility rules apply)' })
  getOne(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('userId') userId: string,
  ) {
    return this.profilesService.getByUserId(
      user?.sub || null,
      user?.role || null,
      userId,
    );
  }

  @Patch('settings/me')
  @ApiOperation({ summary: 'Update basic account settings fields' })
  settings(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSettingsDto) {
    return this.profilesService.updateSettings(user.sub, dto);
  }

  @Post('jobs/:jobId/save')
  @Roles(Role.JOB_SEEKER)
  saveJob(@CurrentUser() user: JwtPayload, @Param('jobId') jobId: string) {
    return this.profilesService.saveJob(user.sub, jobId);
  }

  @Delete('jobs/:jobId/save')
  @Roles(Role.JOB_SEEKER)
  unsaveJob(@CurrentUser() user: JwtPayload, @Param('jobId') jobId: string) {
    return this.profilesService.unsaveJob(user.sub, jobId);
  }

  @Get('jobs/saved')
  @Roles(Role.JOB_SEEKER)
  listSaved(@CurrentUser() user: JwtPayload) {
    return this.profilesService.listSaved(user.sub);
  }
}
