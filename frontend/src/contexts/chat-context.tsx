'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Chat, Message } from '@/types';
import { getChatsAction, getChatMessagesAction } from '@/actions/chats';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';
import { useTyping } from '@/hooks/use-typing';
import { useChatSocketEvents } from '@/hooks/use-chat-socket-events';
import { useChatActions } from '@/hooks/use-chat-actions';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  typingMap: Record<string, string>;
  setActiveChatId: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  createDirectChat: (targetUserId: string) => Promise<Chat>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<Chat>;
  sendTyping: () => void;
  stopTyping: () => void;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socket, status } = useSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingChats(true);
      const data = await getChatsAction();
      setChats(data);
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!activeChatId || !user) {
      setMessages([]);
      return;
    }

    let isSubscribed = true;
    setIsLoadingMessages(true);

    getChatMessagesAction(activeChatId)
      .then((data) => {
        if (isSubscribed) setMessages(data);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingMessages(false);
      });

    if (socket && status === 'connected') {
      socket.emit('join_chat', { chatId: activeChatId });
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeChatId, user, socket, status]);

  const { typingMap, sendTyping, stopTyping } = useTyping({
    socket,
    status,
    activeChatId,
  });

  useChatSocketEvents({
    socket,
    setActiveChatId,
    setMessages,
    setChats,
    fetchChats,
  });

  const { sendMessage, createDirectChat, createGroupChat } = useChatActions({
    user,
    socket,
    status,
    activeChatId,
    setActiveChatId,
    setChats,
    setMessages,
    stopTyping,
  });

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        messages,
        isLoadingChats,
        isLoadingMessages,
        typingMap,
        setActiveChatId,
        sendMessage,
        createDirectChat,
        createGroupChat,
        sendTyping,
        stopTyping,
        refreshChats: fetchChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
