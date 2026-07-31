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
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import { TalentPoolService } from '../services/talent-pool.service';

@ApiTags('Talent Pool')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('talent-pool')
export class TalentPoolController {
  constructor(private readonly talentPoolService: TalentPoolService) {}

  @Get()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'List talent pool' })
  list(@CurrentUser() user: JwtPayload, @Query('folder') folder?: string) {
    return this.talentPoolService.list(user.sub, user.role, folder);
  }

  @Post()
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  add(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.talentPoolService.add(user.sub, user.role, body);
  }

  @Patch(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.talentPoolService.update(user.sub, user.role, id, body);
  }

  @Delete(':id')
  @Roles(Role.EMPLOYER, Role.RECRUITER)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.talentPoolService.remove(user.sub, user.role, id);
  }
}
