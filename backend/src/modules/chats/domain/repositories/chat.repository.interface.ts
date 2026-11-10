import { ChatEntity } from '../entities/chat.entity';

export abstract class IChatRepository {
  abstract findUserChats(userId: string): Promise<ChatEntity[]>;
  abstract findById(id: string): Promise<ChatEntity | null>;

  abstract findDirectChat(
    userId1: string,
    userId2: string,
  ): Promise<ChatEntity | null>;

  abstract create(data: {
    name?: string;
    isGroup: boolean;
    participantIds: string[];
  }): Promise<ChatEntity>;

  abstract isParticipant(chatId: string, userId: string): Promise<boolean>;
  abstract getParticipantIds(chatId: string): Promise<string[]>;
}

export const CHAT_REPOSITORY_TOKEN = 'IChatRepository';
