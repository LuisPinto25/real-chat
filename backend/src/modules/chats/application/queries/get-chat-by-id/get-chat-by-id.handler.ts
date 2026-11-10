import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { GetChatByIdQuery } from './get-chat-by-id.query';
import { ChatResponseDto } from '../../dtos/chat.dto';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../domain/repositories/chat.repository.interface';

@QueryHandler(GetChatByIdQuery)
export class GetChatByIdHandler implements IQueryHandler<
  GetChatByIdQuery,
  ChatResponseDto
> {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(query: GetChatByIdQuery): Promise<ChatResponseDto> {
    const isParticipant = await this.chatRepository.isParticipant(
      query.chatId,
      query.userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    const chat = await this.chatRepository.findById(query.chatId);
    if (!chat) throw new NotFoundException('Conversación no encontrada');

    return chat;
  }
}
