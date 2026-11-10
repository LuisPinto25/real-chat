import { chatApi } from '@/api/chat-api';
import type { Chat } from '@/types';

export const getChatsAction = async (): Promise<Chat[]> => {
  try {
    const { data } = await chatApi.get<Chat[]>('/chats');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
