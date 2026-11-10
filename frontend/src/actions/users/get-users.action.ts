import { chatApi } from '@/api/chat-api';
import type { User } from '@/types';

export const getUsersAction = async (): Promise<User[]> => {
  try {
    const { data } = await chatApi.get<User[]>('/users');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
