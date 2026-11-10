import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CHAT_REPOSITORY_TOKEN } from './domain/repositories/chat.repository.interface';
import { PrismaChatRepository } from './infrastructure/repositories/prisma-chat.repository';
import { CreateChatHandler } from './application/commands/create-chat/create-chat.handler';
import { GetUserChatsHandler } from './application/queries/get-user-chats/get-user-chats.handler';
import { GetChatByIdHandler } from './application/queries/get-chat-by-id/get-chat-by-id.handler';
import { ChatsController } from './presentation/controllers/chats.controller';
import { AuthModule } from '../auth/auth.module';

const CommandHandlers = [CreateChatHandler];
const QueryHandlers = [GetUserChatsHandler, GetChatByIdHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [ChatsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: CHAT_REPOSITORY_TOKEN,
      useClass: PrismaChatRepository,
    },
  ],
  exports: [CHAT_REPOSITORY_TOKEN],
})
export class ChatsModule {}
