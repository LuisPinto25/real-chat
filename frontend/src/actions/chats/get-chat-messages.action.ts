import { chatApi } from '@/api/chat-api';
import type { Message } from '@/types';

export const getChatMessagesAction = async (
  chatId: string,
): Promise<Message[]> => {
  try {
    const { data } = await chatApi.get<Message[]>(`/chats/${chatId}/messages`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
