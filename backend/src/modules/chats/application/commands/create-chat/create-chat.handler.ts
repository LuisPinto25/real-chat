import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { CreateChatCommand } from './create-chat.command';
import { ChatResponseDto } from '../../dtos/chat.dto';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../domain/repositories/chat.repository.interface';

@CommandHandler(CreateChatCommand)
export class CreateChatHandler implements ICommandHandler<
  CreateChatCommand,
  ChatResponseDto
> {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: CreateChatCommand): Promise<ChatResponseDto> {
    const { currentUserId, dto } = command;
    const { participantIds, name, isGroup } = dto;

    const uniqueOtherParticipantIds = Array.from(
      new Set(participantIds.filter((id) => id !== currentUserId)),
    );

    if (uniqueOtherParticipantIds.length === 0) {
      throw new BadRequestException(
        'Debes seleccionar al menos a otro usuario para chatear',
      );
    }

    const isGroupChat = isGroup || uniqueOtherParticipantIds.length > 1;

    if (!isGroupChat) {
      const otherUserId = uniqueOtherParticipantIds[0];
      const existingChat = await this.chatRepository.findDirectChat(
        currentUserId,
        otherUserId,
      );

      if (existingChat) {
        return existingChat;
      }
    }

    const allParticipants = [currentUserId, ...uniqueOtherParticipantIds];

    const groupName = isGroupChat ? name?.trim() || 'Nuevo Grupo' : null;

    const newChat = await this.chatRepository.create({
      name: groupName,
      isGroup: isGroupChat,
      participantIds: allParticipants,
    });

    return newChat;
  }
}
