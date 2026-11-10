export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  user?: User;
  joinedAt?: string;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName?: string;
}

export interface Chat {
  id: string;
  name: string | null;
  isGroup: boolean;
  participants: ChatParticipant[];
  lastMessage?: LastMessage | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  sender?: User;
  createdAt: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
