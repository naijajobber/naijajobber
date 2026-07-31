import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { MessagingService } from '../services/messaging.service';

type AuthedSocket = Socket & { userId?: string };

@WebSocketGateway({
  namespace: '/messaging',
  cors: { origin: true, credentials: true },
})
export class MessagingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MessagingGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization || '').replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        {
          secret: this.config.getOrThrow<string>('jwt.accessSecret'),
        },
      );
      client.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Socket connected ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('conversation:join')
  async joinRoom(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    if (!client.userId) return;
    await this.messagingService.assertParticipant(
      body.conversationId,
      client.userId,
    );
    client.join(`conversation:${body.conversationId}`);
    return { joined: body.conversationId };
  }

  @SubscribeMessage('message:send')
  async send(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    body: { conversationId: string; text?: string; attachments?: unknown[] },
  ) {
    if (!client.userId) return;
    const message = await this.messagingService.sendMessage(
      body.conversationId,
      client.userId,
      {
        body: body.text,
        attachments: body.attachments as never,
      },
    );
    this.server
      .to(`conversation:${body.conversationId}`)
      .emit('message:new', message);
    return message;
  }

  @SubscribeMessage('typing:start')
  typingStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    if (!client.userId) return;
    client
      .to(`conversation:${body.conversationId}`)
      .emit('typing:start', { userId: client.userId });
  }

  @SubscribeMessage('typing:stop')
  typingStop(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    if (!client.userId) return;
    client
      .to(`conversation:${body.conversationId}`)
      .emit('typing:stop', { userId: client.userId });
  }

  @SubscribeMessage('message:read')
  async read(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { messageId: string; conversationId: string },
  ) {
    if (!client.userId) return;
    const message = await this.messagingService.markMessageRead(
      body.messageId,
      client.userId,
    );
    this.server
      .to(`conversation:${body.conversationId}`)
      .emit('message:read', {
        messageId: body.messageId,
        userId: client.userId,
        readBy: message.readBy,
      });
    return message;
  }
}
