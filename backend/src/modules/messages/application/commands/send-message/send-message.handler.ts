import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { SendMessageCommand } from './send-message.command';
import { MessageResponseDto } from '../../dtos/message.dto';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
} from '../../../domain/repositories/message.repository.interface';
import {
  CHAT_REPOSITORY_TOKEN,
  IChatRepository,
} from '../../../../chats/domain/repositories/chat.repository.interface';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<
  SendMessageCommand,
  MessageResponseDto
> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: SendMessageCommand): Promise<MessageResponseDto> {
    const { senderId, chatId, content } = command;

    const isParticipant = await this.chatRepository.isParticipant(
      chatId,
      senderId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'No tienes permiso para enviar mensajes a este chat',
      );
    }

    const message = await this.messageRepository.create({
      chatId,
      senderId,
      content: content.trim(),
    });

    return message;
  }
}
