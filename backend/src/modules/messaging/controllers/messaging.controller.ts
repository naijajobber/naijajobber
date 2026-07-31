import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  CreateConversationDto,
  MessagesQueryDto,
  SendMessageDto,
} from '../dto/messaging.dto';
import { MessagingService } from '../services/messaging.service';
import { UploadService } from '../../../infrastructure/uploads/upload.service';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('conversations')
  @Roles(Role.JOB_SEEKER, Role.EMPLOYER, Role.RECRUITER)
  @ApiOperation({ summary: 'Open or get conversation for an application' })
  openConversation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.openConversation(user.sub, user.role, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List my conversations' })
  list(@CurrentUser() user: JwtPayload) {
    return this.messagingService.listConversations(user.sub);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'List messages in a conversation' })
  listMessages(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: MessagesQueryDto,
  ) {
    return this.messagingService.listMessages(
      id,
      user.sub,
      query.page || 1,
      query.limit || 50,
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user.sub, dto);
  }

  @Post('messaging/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload message attachment' })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded', data: null };
    }
    return this.uploadService.saveFile(file);
  }
}
