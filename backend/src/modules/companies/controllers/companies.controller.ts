import {
  Body,
  Controller,
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
  CreateCompanyDto,
  GenerateApiKeyDto,
  RegisterWebhookDto,
  UpdateCompanyDto,
} from '../dto/company.dto';
import { CompaniesService } from '../services/companies.service';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Create a company' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Get my company' })
  getMine(@CurrentUser() user: JwtPayload) {
    return this.companiesService.getMine(user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mine/verification/documents')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload a verification document' })
  uploadVerificationDoc(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    return this.companiesService.addVerificationDocument(
      user.sub,
      user.role,
      type,
      file,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mine/verification/resubmit')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Resubmit company for verification' })
  resubmit(@CurrentUser() user: JwtPayload) {
    return this.companiesService.resubmitVerification(user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mine/api-keys')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Generate a mock API key' })
  generateKey(@CurrentUser() user: JwtPayload, @Body() dto: GenerateApiKeyDto) {
    return this.companiesService.generateApiKey(user.sub, user.role, dto.label);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mine/api-keys/:prefix/revoke')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Revoke an API key by prefix' })
  revokeKey(@CurrentUser() user: JwtPayload, @Param('prefix') prefix: string) {
    return this.companiesService.revokeApiKey(user.sub, user.role, prefix);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mine/webhooks')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Register a webhook URL (store only)' })
  webhook(@CurrentUser() user: JwtPayload, @Body() dto: RegisterWebhookDto) {
    return this.companiesService.registerWebhook(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('mine/integrations')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Toggle mock integration flags' })
  integrations(
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, boolean>,
  ) {
    return this.companiesService.updateIntegrations(user.sub, user.role, body);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get company by slug (public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER, Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update company' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/verify')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Verify company (admin)' })
  verify(@Param('id') id: string) {
    return this.companiesService.verify(id);
  }
}
