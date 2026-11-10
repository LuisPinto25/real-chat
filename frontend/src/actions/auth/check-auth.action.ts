import { chatApi } from '@/api/chat-api';
import type { User } from '@/types';

export const checkAuthAction = async (): Promise<User> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) throw new Error('No token found');

  try {
    const { data } = await chatApi.get<User>('/auth/me');
    return data;
  } catch (error) {
    console.error(error);
    localStorage.removeItem('token');
    throw new Error('Token expired or not valid');
  }
};
