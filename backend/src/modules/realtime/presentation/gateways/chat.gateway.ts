import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { envs } from '../../../../config/envs';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../chats/domain/repositories/chat.repository.interface';
import { SendMessageCommand } from '../../../messages/application/commands/send-message/send-message.command';
import { CreateChatCommand } from '../../../chats/application/commands/create-chat/create-chat.command';
import { CreateChatDto } from '../../../chats/application/dtos/chat.dto';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(
          `Client connection rejected: missing token [${client.id}]`,
        );
        client.disconnect(true);
        return;
      }

      const decoded = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };

      client.data.user = user;

      client.join(`user_${user.id}`);

      const userChats = await this.chatRepository.findUserChats(user.id);

      for (const chat of userChats) {
        client.join(`chat_${chat.id}`);
      }

      const currentCount = this.onlineUsers.get(user.id) || 0;
      this.onlineUsers.set(user.id, currentCount + 1);

      const onlineUserIds = Array.from(this.onlineUsers.keys());
      client.emit('online_users', onlineUserIds);

      if (currentCount === 0) {
        this.server.emit('user_status', { userId: user.id, status: 'online' });
      }

      this.logger.log(
        `User connected: ${user.name} (${user.id}) socket=${client.id}`,
      );
    } catch (err: any) {
      this.logger.error(`Socket auth failed: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;

    if (user) {
      const count = (this.onlineUsers.get(user.id) || 1) - 1;
      if (count <= 0) {
        this.onlineUsers.delete(user.id);
        this.server.emit('user_status', { userId: user.id, status: 'offline' });
      } else {
        this.onlineUsers.set(user.id, count);
      }
      this.logger.log(
        `User disconnected: ${user.name} (${user.id}) socket=${client.id}`,
      );
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = client.data.user;
    if (!user || !data.chatId) return { error: 'Invalid payload' };

    const isParticipant = await this.chatRepository.isParticipant(
      data.chatId,
      user.id,
    );
    if (!isParticipant) {
      return { error: 'Forbidden: You are not in this chat' };
    }

    client.join(`chat_${data.chatId}`);
    return { success: true, chatId: data.chatId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    const user = client.data.user;
    if (!user || !data.chatId || !data.content?.trim()) {
      return { error: 'Chat ID y contenido son requeridos' };
    }

    try {
      const message = await this.commandBus.execute(
        new SendMessageCommand(user.id, data.chatId, data.content),
      );

      this.server.to(`chat_${data.chatId}`).emit('new_message', message);

      const participantIds = await this.chatRepository.getParticipantIds(
        data.chatId,
      );
      for (const pId of participantIds) {
        this.server.to(`user_${pId}`).emit('chat_updated', {
          chatId: data.chatId,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            senderName: message.sender?.name,
          },
          updatedAt: new Date(),
        });
      }

      return { success: true, message };
    } catch (error: any) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('create_chat')
  async handleCreateChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateChatDto,
  ) {
    const user = client.data.user;
    if (!user) return { error: 'Unauthorized' };

    try {
      const newChat = await this.commandBus.execute(
        new CreateChatCommand(user.id, data),
      );

      for (const participant of newChat.participants) {
        this.server
          .to(`user_${participant.userId}`)
          .emit('chat_created', newChat);
      }

      client.join(`chat_${newChat.id}`);

      return { success: true, chat: newChat };
    } catch (error: any) {
      this.logger.error(`Error creating chat via socket: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = client.data.user;
    if (!user || !data.chatId) return;

    client.to(`chat_${data.chatId}`).emit('user_typing', {
      chatId: data.chatId,
      userId: user.id,
      userName: user.name,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = client.data.user;
    if (!user || !data.chatId) return;

    client.to(`chat_${data.chatId}`).emit('user_stop_typing', {
      chatId: data.chatId,
      userId: user.id,
    });
  }
}
