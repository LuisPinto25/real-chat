import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MESSAGE_REPOSITORY_TOKEN } from './domain/repositories/message.repository.interface';
import { PrismaMessageRepository } from './infrastructure/repositories/prisma-message.repository';
import { SendMessageHandler } from './application/commands/send-message/send-message.handler';
import { GetChatMessagesHandler } from './application/queries/get-chat-messages/get-chat-messages.handler';
import { MessagesController } from './presentation/controllers/messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { AuthModule } from '../auth/auth.module';

const CommandHandlers = [SendMessageHandler];
const QueryHandlers = [GetChatMessagesHandler];

@Module({
  imports: [CqrsModule, ChatsModule, AuthModule],
  controllers: [MessagesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: PrismaMessageRepository,
    },
  ],
  exports: [MESSAGE_REPOSITORY_TOKEN, ...CommandHandlers, ...QueryHandlers],
})
export class MessagesModule {}
