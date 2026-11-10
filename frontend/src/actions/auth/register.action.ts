import { chatApi } from '@/api/chat-api';
import type { AuthResponse } from '@/types';

export const registerAction = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const { data } = await chatApi.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
