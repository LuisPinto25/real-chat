import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ChatGateway } from './presentation/gateways/chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatsModule } from '../chats/chats.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [CqrsModule, AuthModule, ChatsModule, MessagesModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class RealtimeModule {}
