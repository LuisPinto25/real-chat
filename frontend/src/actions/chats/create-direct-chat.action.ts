import { chatApi } from '@/api/chat-api';
import type { Chat } from '@/types';

export const createDirectChatAction = async (
  targetUserId: string,
): Promise<Chat> => {
  try {
    const { data } = await chatApi.post<Chat>('/chats', {
      participantIds: [targetUserId],
      isGroup: false,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
