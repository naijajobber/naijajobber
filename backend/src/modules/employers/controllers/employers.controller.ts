import {
  Body,
  Controller,
  Delete,
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
import { UpdateEmployerDto, UpsertEmployerDto } from '../dto/employer.dto';
import { EmployersService } from '../services/employers.service';

@ApiTags('Employers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @Post('me')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Upsert current employer profile' })
  upsertMe(@CurrentUser() user: JwtPayload, @Body() dto: UpsertEmployerDto) {
    return this.employersService.upsertMe(user.sub, user.role, dto);
  }

  @Get('me')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Get current employer profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.employersService.getMe(user.sub, user.role);
  }

  @Get('me/overview')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Employer dashboard overview aggregates' })
  overview(@CurrentUser() user: JwtPayload) {
    return this.employersService.getOverview(user.sub, user.role);
  }

  @Get('me/analytics')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Employer analytics snapshot' })
  analytics(@CurrentUser() user: JwtPayload) {
    return this.employersService.getAnalytics(user.sub, user.role);
  }

  @Patch('me')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Update current employer profile' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateEmployerDto) {
    return this.employersService.updateMe(user.sub, user.role, dto);
  }

  @Get('team')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'List company team members' })
  team(@CurrentUser() user: JwtPayload) {
    return this.employersService.listTeam(user.sub, user.role);
  }

  @Post('team/invite')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Invite a team member by email' })
  invite(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: { email: string; companyRole: string; title?: string },
  ) {
    return this.employersService.inviteTeamMember(user.sub, user.role, body);
  }

  @Patch('team/:id/role')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Update team member role' })
  updateRole(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { companyRole: string },
  ) {
    return this.employersService.updateTeamRole(
      user.sub,
      user.role,
      id,
      body.companyRole,
    );
  }

  @Post('team/:id/deactivate')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Deactivate team member' })
  deactivate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employersService.deactivateTeamMember(user.sub, user.role, id);
  }

  @Delete('team/:id')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Remove team member' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employersService.removeTeamMember(user.sub, user.role, id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'List employers (admin)' })
  list() {
    return this.employersService.listForAdmin();
  }
}
