import { chatApi } from '@/api/chat-api';
import type { Chat } from '@/types';

export const createGroupChatAction = async (
  name: string,
  participantIds: string[],
): Promise<Chat> => {
  try {
    const { data } = await chatApi.post<Chat>('/chats', {
      name,
      participantIds,
      isGroup: true,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
