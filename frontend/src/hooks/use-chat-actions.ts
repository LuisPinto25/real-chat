'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Socket } from 'socket.io-client';
import type { Chat, Message, User, ConnectionStatus } from '@/types';
import {
  sendMessageAction,
  createDirectChatAction,
  createGroupChatAction,
} from '@/actions/chats';

interface UseChatActionsOptions {
  user: User | null;
  socket: Socket | null;
  status: ConnectionStatus;
  activeChatId: string | null;
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  setChats: Dispatch<SetStateAction<Chat[]>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  stopTyping: () => void;
}

export function useChatActions({
  user,
  socket,
  status,
  activeChatId,
  setActiveChatId,
  setChats,
  setMessages,
  stopTyping,
}: UseChatActionsOptions) {
  const upsertChatAndSelect = useCallback(
    (createdChat: Chat) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === createdChat.id)) return prev;
        return [createdChat, ...prev];
      });
      setActiveChatId(createdChat.id);
    },
    [setChats, setActiveChatId],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeChatId || !content.trim() || !user) return;

      stopTyping();

      if (socket && status === 'connected') {
        socket.emit('send_message', {
          chatId: activeChatId,
          content: content.trim(),
        });
      } else {
        const newMsg = await sendMessageAction(activeChatId, content.trim());
        setMessages((prev) => [...prev, newMsg]);
      }
    },
    [activeChatId, user, stopTyping, socket, status, setMessages],
  );

  const createDirectChat = useCallback(
    async (targetUserId: string): Promise<Chat> => {
      if (socket && status === 'connected') {
        return new Promise((resolve, reject) => {
          socket.emit(
            'create_chat',
            { participantIds: [targetUserId], isGroup: false },
            (response: { error?: string; chat?: Chat }) => {
              if (response?.error) {
                reject(new Error(response.error));
              } else if (response?.chat) {
                upsertChatAndSelect(response.chat);
                resolve(response.chat);
              } else {
                reject(new Error('No se pudo crear el chat'));
              }
            },
          );
        });
      }

      const newChat = await createDirectChatAction(targetUserId);
      upsertChatAndSelect(newChat);
      return newChat;
    },
    [socket, status, upsertChatAndSelect],
  );

  const createGroupChat = useCallback(
    async (name: string, participantIds: string[]): Promise<Chat> => {
      if (socket && status === 'connected') {
        return new Promise((resolve, reject) => {
          socket.emit(
            'create_chat',
            { name: name.trim(), participantIds, isGroup: true },
            (response: { error?: string; chat?: Chat }) => {
              if (response?.error) {
                reject(new Error(response.error));
              } else if (response?.chat) {
                upsertChatAndSelect(response.chat);
                resolve(response.chat);
              } else {
                reject(new Error('No se pudo crear el grupo'));
              }
            },
          );
        });
      }

      const newChat = await createGroupChatAction(name.trim(), participantIds);
      upsertChatAndSelect(newChat);
      return newChat;
    },
    [socket, status, upsertChatAndSelect],
  );

  return {
    sendMessage,
    createDirectChat,
    createGroupChat,
  };
}
