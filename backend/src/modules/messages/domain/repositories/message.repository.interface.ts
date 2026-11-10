import { MessageEntity } from '../entities/message.entity';

export abstract class IMessageRepository {
  abstract create(data: {
    content: string;
    chatId: string;
    senderId: string;
  }): Promise<MessageEntity>;

  abstract findByChatId(
    chatId: string,
    limit?: number,
  ): Promise<MessageEntity[]>;
}

export const MESSAGE_REPOSITORY_TOKEN = 'IMessageRepository';
