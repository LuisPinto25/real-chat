import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserChatsQuery } from './get-user-chats.query';
import { ChatResponseDto } from '../../dtos/chat.dto';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../domain/repositories/chat.repository.interface';

@QueryHandler(GetUserChatsQuery)
export class GetUserChatsHandler implements IQueryHandler<
  GetUserChatsQuery,
  ChatResponseDto[]
> {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(query: GetUserChatsQuery): Promise<ChatResponseDto[]> {
    return this.chatRepository.findUserChats(query.userId);
  }
}
