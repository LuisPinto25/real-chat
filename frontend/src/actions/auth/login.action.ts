import { chatApi } from '@/api/chat-api';
import type { AuthResponse } from '@/types';

export const loginAction = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const { data } = await chatApi.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
