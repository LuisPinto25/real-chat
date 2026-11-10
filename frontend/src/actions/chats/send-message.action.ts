import { chatApi } from '@/api/chat-api';
import type { Message } from '@/types';

export const sendMessageAction = async (
  chatId: string,
  content: string,
): Promise<Message> => {
  try {
    const { data } = await chatApi.post<Message>(`/chats/${chatId}/messages`, {
      content,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
