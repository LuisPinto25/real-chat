'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Socket } from 'socket.io-client';
import type { Chat, Message, LastMessage } from '@/types';

interface UseChatSocketEventsOptions {
  socket: Socket | null;
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setChats: Dispatch<SetStateAction<Chat[]>>;
  fetchChats: () => Promise<void>;
}

export function useChatSocketEvents({
  socket,
  setActiveChatId,
  setMessages,
  setChats,
  fetchChats,
}: UseChatSocketEventsOptions) {
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      setActiveChatId((currentActiveId) => {
        if (currentActiveId === newMessage.chatId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
        return currentActiveId;
      });

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (c) => c.id === newMessage.chatId,
        );
        if (chatIndex === -1) {
          fetchChats();
          return prevChats;
        }

        const targetChat: Chat = {
          ...prevChats[chatIndex],
          lastMessage: {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            senderId: newMessage.senderId,
            senderName: newMessage.sender?.name,
          },
          updatedAt: newMessage.createdAt,
        };

        const updated = [...prevChats];
        updated.splice(chatIndex, 1);
        return [targetChat, ...updated];
      });
    };

    const handleChatUpdated = ({
      chatId,
      lastMessage,
      updatedAt,
    }: {
      chatId: string;
      lastMessage: LastMessage | null;
      updatedAt: string;
    }) => {
      setChats((prev) => {
        const index = prev.findIndex((c) => c.id === chatId);
        if (index === -1) {
          fetchChats();
          return prev;
        }
        const updatedChat = {
          ...prev[index],
          lastMessage,
          updatedAt,
        };
        const rest = prev.filter((c) => c.id !== chatId);
        return [updatedChat, ...rest];
      });
    };

    const handleChatCreated = (newChat: Chat) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev;
        return [newChat, ...prev];
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('chat_created', handleChatCreated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('chat_created', handleChatCreated);
    };
  }, [socket, setActiveChatId, setMessages, setChats, fetchChats]);
}
