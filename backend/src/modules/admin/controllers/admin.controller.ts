import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  AdminApiKeyDto,
  AdminAssignModeratorDto,
  AdminBlogPostDto,
  AdminBroadcastDto,
  AdminCmsPageDto,
  AdminCompaniesQueryDto,
  AdminCouponDto,
  AdminFlagJobDto,
  AdminJobPatchDto,
  AdminLearningItemDto,
  AdminListQueryDto,
  AdminPlanDto,
  AdminRejectCompanyDto,
  AdminRequestInfoDto,
  AdminSettingsPatchDto,
  AdminTicketUpdateDto,
  AdminUpdateRoleDto,
} from '../dto/admin.dto';
import { AdminService } from '../services/admin.service';

const STAFF = [Role.ADMIN, Role.SUPER_ADMIN] as const;
const OVERVIEW = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.MODERATOR,
  Role.SUPPORT_AGENT,
  Role.FINANCE_MANAGER,
  Role.MARKETING_MANAGER,
] as const;
const MOD = [...STAFF, Role.MODERATOR] as const;
const SUPPORT = [...STAFF, Role.SUPPORT_AGENT] as const;
const FINANCE = [...STAFF, Role.FINANCE_MANAGER] as const;
const MARKETING = [...STAFF, Role.MARKETING_MANAGER] as const;

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @Roles(...OVERVIEW)
  @ApiOperation({ summary: 'Admin dashboard overview counts' })
  overview() {
    return this.adminService.overview();
  }

  @Get('search')
  @Roles(...STAFF)
  search(@Query('q') q: string) {
    return this.adminService.search(q || '');
  }

  @Get('users')
  @Roles(...SUPPORT)
  listUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/role')
  @Roles(...STAFF)
  updateRole(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminUpdateRoleDto,
  ) {
    return this.adminService.updateUserRole(user.sub, id, dto.role);
  }

  @Post('users/:id/suspend')
  @Roles(...STAFF)
  suspendUser(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.suspendUser(user.sub, id);
  }

  @Post('users/:id/reactivate')
  @Roles(...STAFF)
  reactivateUser(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.reactivateUser(user.sub, id);
  }

  @Post('users/:id/verify-email')
  @Roles(...STAFF)
  verifyEmail(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.forceVerifyEmail(user.sub, id);
  }

  @Post('users/:id/reset-password')
  @Roles(...STAFF)
  resetPassword(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.resetUserPassword(user.sub, id);
  }

  @Delete('users/:id')
  @Roles(...STAFF)
  softDeleteUser(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.softDeleteUser(user.sub, id);
  }

  @Get('employers')
  @Roles(...STAFF)
  listEmployers(@Query() query: AdminListQueryDto) {
    return this.adminService.listEmployers(query);
  }

  @Post('employers/:id/deactivate')
  @Roles(...STAFF)
  deactivateEmployer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.deactivateEmployerMembership(user.sub, id);
  }

  @Get('companies')
  @Roles(...MOD)
  listCompanies(@Query() query: AdminCompaniesQueryDto) {
    return this.adminService.listCompanies(query);
  }

  @Post('companies/:id/verify')
  @Roles(...MOD)
  verifyCompany(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.verifyCompany(user.sub, id);
  }

  @Post('companies/:id/reject')
  @Roles(...MOD)
  rejectCompany(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminRejectCompanyDto,
  ) {
    return this.adminService.rejectCompany(user.sub, id, dto);
  }

  @Post('companies/:id/request-info')
  @Roles(...MOD)
  requestInfo(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminRequestInfoDto,
  ) {
    return this.adminService.requestCompanyInfo(user.sub, id, dto);
  }

  @Post('companies/:id/assign-moderator')
  @Roles(...MOD)
  assignModerator(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminAssignModeratorDto,
  ) {
    return this.adminService.assignCompanyModerator(
      user.sub,
      id,
      dto.moderatorUserId,
    );
  }

  @Get('jobs')
  @Roles(...MOD)
  listJobs(@Query() query: AdminListQueryDto) {
    return this.adminService.listJobs(query);
  }

  @Post('jobs/:id/unpublish')
  @Roles(...MOD)
  unpublishJob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.unpublishJob(user.sub, id);
  }

  @Post('jobs/:id/approve-publish')
  @Roles(...MOD)
  approvePublish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.approvePublishJob(user.sub, id);
  }

  @Post('jobs/:id/flag')
  @Roles(...MOD)
  flagJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminFlagJobDto,
  ) {
    return this.adminService.flagJob(user.sub, id, dto);
  }

  @Post('jobs/:id/feature')
  @Roles(...MOD)
  featureJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { featured?: boolean },
  ) {
    return this.adminService.featureJob(user.sub, id, body.featured !== false);
  }

  @Post('jobs/:id/sponsor')
  @Roles(...MOD)
  sponsorJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { sponsored?: boolean },
  ) {
    return this.adminService.sponsorJob(user.sub, id, body.sponsored !== false);
  }

  @Post('jobs/:id/pause')
  @Roles(...MOD)
  pauseJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { paused?: boolean },
  ) {
    return this.adminService.pauseJob(user.sub, id, body.paused !== false);
  }

  @Post('jobs/:id/close')
  @Roles(...MOD)
  closeJob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.closeJob(user.sub, id);
  }

  @Post('jobs/:id/archive')
  @Roles(...MOD)
  archiveJob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.archiveJob(user.sub, id);
  }

  @Post('jobs/:id/duplicate')
  @Roles(...MOD)
  duplicateJob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.duplicateJob(user.sub, id);
  }

  @Delete('jobs/:id')
  @Roles(...MOD)
  softDeleteJob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.softDeleteJob(user.sub, id);
  }

  @Patch('jobs/:id')
  @Roles(...MOD)
  patchJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminJobPatchDto,
  ) {
    return this.adminService.patchJob(user.sub, id, dto);
  }

  @Get('jobs/:id/applicants')
  @Roles(...MOD)
  listApplicants(@Param('id') id: string, @Query() query: AdminListQueryDto) {
    return this.adminService.listJobApplicants(id, query);
  }

  @Get('applications')
  @Roles(...MOD)
  listApplications(@Query() query: AdminListQueryDto) {
    return this.adminService.listApplications(query);
  }

  @Get('billing/transactions')
  @Roles(...FINANCE)
  listTransactions(@Query() query: AdminListQueryDto) {
    return this.adminService.listTransactions(query);
  }

  @Post('billing/transactions/:id/retry-mark')
  @Roles(...FINANCE)
  retryMark(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.retryMarkTransaction(user.sub, id);
  }

  @Get('billing/refunds')
  @Roles(...FINANCE)
  listRefunds(@Query() query: AdminListQueryDto) {
    return this.adminService.listRefunds(query);
  }

  @Patch('billing/refunds/:id')
  @Roles(...FINANCE)
  reviewRefund(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.adminService.reviewRefund(user.sub, id, body.status);
  }

  @Get('billing/plans')
  @Roles(...FINANCE)
  listPlans() {
    return this.adminService.listPlans();
  }

  @Put('billing/plans')
  @Roles(...FINANCE)
  upsertPlan(@CurrentUser() user: JwtPayload, @Body() dto: AdminPlanDto) {
    return this.adminService.upsertPlan(user.sub, dto);
  }

  @Get('billing/coupons')
  @Roles(...FINANCE)
  listCoupons() {
    return this.adminService.listCoupons();
  }

  @Post('billing/coupons')
  @Roles(...FINANCE)
  createCoupon(@CurrentUser() user: JwtPayload, @Body() dto: AdminCouponDto) {
    return this.adminService.createCoupon(user.sub, dto);
  }

  @Get('revenue/analytics')
  @Roles(...FINANCE)
  revenueAnalytics() {
    return this.adminService.revenueAnalytics();
  }

  @Get('audit')
  @Roles(...STAFF)
  listAudit(@Query() query: AdminListQueryDto) {
    return this.adminService.listAudit(query);
  }

  @Get('rbac/matrix')
  @Roles(...STAFF)
  rbacMatrix() {
    return this.adminService.getRbacMatrix();
  }

  @Get('support/tickets')
  @Roles(...SUPPORT)
  listTickets(@Query() query: AdminListQueryDto) {
    return this.adminService.listSupportTickets(query);
  }

  @Patch('support/tickets/:id')
  @Roles(...SUPPORT)
  updateTicket(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminTicketUpdateDto,
  ) {
    return this.adminService.updateSupportTicket(user.sub, id, dto);
  }

  @Get('referrals')
  @Roles(...MARKETING)
  referrals() {
    return this.adminService.referralsAdmin();
  }

  @Post('notifications/broadcast')
  @Roles(...MARKETING)
  broadcast(@CurrentUser() user: JwtPayload, @Body() dto: AdminBroadcastDto) {
    return this.adminService.broadcast(user.sub, dto);
  }

  @Get('cms/pages')
  @Roles(...MARKETING)
  listCmsPages() {
    return this.adminService.listCmsPages();
  }

  @Post('cms/pages')
  @Roles(...MARKETING)
  createCmsPage(@CurrentUser() user: JwtPayload, @Body() dto: AdminCmsPageDto) {
    return this.adminService.upsertCmsPage(user.sub, dto);
  }

  @Patch('cms/pages/:id')
  @Roles(...MARKETING)
  updateCmsPage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminCmsPageDto,
  ) {
    return this.adminService.upsertCmsPage(user.sub, dto, id);
  }

  @Delete('cms/pages/:id')
  @Roles(...MARKETING)
  deleteCmsPage(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.deleteCmsPage(user.sub, id);
  }

  @Get('cms/blog')
  @Roles(...MARKETING)
  listBlog() {
    return this.adminService.listBlogPosts();
  }

  @Post('cms/blog')
  @Roles(...MARKETING)
  createBlog(@CurrentUser() user: JwtPayload, @Body() dto: AdminBlogPostDto) {
    return this.adminService.upsertBlogPost(user.sub, dto);
  }

  @Patch('cms/blog/:id')
  @Roles(...MARKETING)
  updateBlog(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminBlogPostDto,
  ) {
    return this.adminService.upsertBlogPost(user.sub, dto, id);
  }

  @Delete('cms/blog/:id')
  @Roles(...MARKETING)
  deleteBlog(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.deleteBlogPost(user.sub, id);
  }

  @Get('learning')
  @Roles(...MARKETING)
  listLearning() {
    return this.adminService.listLearningAdmin();
  }

  @Post('learning')
  @Roles(...MARKETING)
  createLearning(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdminLearningItemDto,
  ) {
    return this.adminService.createLearningItem(user.sub, dto);
  }

  @Patch('learning/:id')
  @Roles(...MARKETING)
  updateLearning(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminLearningItemDto,
  ) {
    return this.adminService.updateLearningItem(user.sub, id, dto);
  }

  @Delete('learning/:id')
  @Roles(...MARKETING)
  deleteLearning(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.deleteLearningItem(user.sub, id);
  }

  @Get('impact')
  @Roles(...MARKETING)
  impact() {
    return this.adminService.impact();
  }

  @Get('reports/:type')
  @Roles(...STAFF)
  report(
    @Param('type') type: string,
    @Query('format') format?: 'json' | 'csv',
  ) {
    return this.adminService.report(type, format || 'json');
  }

  @Get('ai/usage')
  @Roles(...STAFF)
  aiUsage() {
    return this.adminService.aiUsage();
  }

  @Get('settings')
  @Roles(...STAFF)
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @Roles(...STAFF)
  patchSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdminSettingsPatchDto,
  ) {
    return this.adminService.patchSettings(user.sub, dto);
  }

  @Post('api-keys')
  @Roles(...STAFF)
  generateApiKey(@CurrentUser() user: JwtPayload, @Body() dto: AdminApiKeyDto) {
    return this.adminService.generateApiKey(user.sub, dto.name);
  }

  @Delete('api-keys/:id')
  @Roles(...STAFF)
  revokeApiKey(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminService.revokeApiKey(user.sub, id);
  }

  @Get('fraud/signals')
  @Roles(...STAFF)
  fraudSignals() {
    return this.adminService.fraudSignals();
  }
}
