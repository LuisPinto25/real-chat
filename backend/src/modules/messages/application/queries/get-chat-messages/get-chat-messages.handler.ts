import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { GetChatMessagesQuery } from './get-chat-messages.query';
import { MessageResponseDto } from '../../dtos/message.dto';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
} from '../../../domain/repositories/message.repository.interface';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../../chats/domain/repositories/chat.repository.interface';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesHandler implements IQueryHandler<
  GetChatMessagesQuery,
  MessageResponseDto[]
> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(query: GetChatMessagesQuery): Promise<MessageResponseDto[]> {
    const isParticipant = await this.chatRepository.isParticipant(
      query.chatId,
      query.userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'No tienes acceso a los mensajes de este chat',
      );
    }

    return this.messageRepository.findByChatId(query.chatId, query.limit);
  }
}
