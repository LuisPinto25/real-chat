'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Chat, Message, LastMessage } from '@/types';
import { apiRequest } from '@/lib/api';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';

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

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { socket, status } = useSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [typingMap, setTypingMap] = useState<Record<string, string>>({});

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingChats(true);
      const data = await apiRequest<Chat[]>('/chats');
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

    apiRequest<Message[]>(`/chats/${activeChatId}/messages`)
      .then((data) => {
        if (isSubscribed) {
          setMessages(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingMessages(false);
        }
      });

    if (socket && status === 'connected') {
      socket.emit('join_chat', { chatId: activeChatId });
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeChatId, user, socket, status]);

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

        const targetChat = {
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

    const handleUserTyping = ({
      chatId,
      userName,
    }: {
      chatId: string;
      userId: string;
      userName: string;
    }) => {
      setTypingMap((prev) => ({ ...prev, [chatId]: userName }));
    };

    const handleUserStopTyping = ({ chatId }: { chatId: string }) => {
      setTypingMap((prev) => {
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('chat_created', handleChatCreated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('chat_created', handleChatCreated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, fetchChats]);

  const sendMessage = async (content: string) => {
    if (!activeChatId || !content.trim() || !user) return;

    stopTyping();

    if (socket && status === 'connected') {
      socket.emit('send_message', {
        chatId: activeChatId,
        content: content.trim(),
      });
    } else {
      const newMsg = await apiRequest<Message>(
        `/chats/${activeChatId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content: content.trim() }),
        },
      );
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  const createDirectChat = async (targetUserId: string): Promise<Chat> => {
    if (socket && status === 'connected') {
      return new Promise((resolve, reject) => {
        socket.emit(
          'create_chat',
          { participantIds: [targetUserId], isGroup: false },
          (response: { error?: string; chat?: Chat }) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else if (response?.chat) {
              const createdChat = response.chat;
              setChats((prev) => {
                if (prev.some((c) => c.id === createdChat.id)) return prev;
                return [createdChat, ...prev];
              });
              setActiveChatId(createdChat.id);
              resolve(createdChat);
            } else {
              reject(new Error('No se pudo crear el chat'));
            }
          },
        );
      });
    } else {
      const newChat = await apiRequest<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify({
          participantIds: [targetUserId],
          isGroup: false,
        }),
      });
      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev;
        return [newChat, ...prev];
      });
      setActiveChatId(newChat.id);
      return newChat;
    }
  };

  const createGroupChat = async (
    name: string,
    participantIds: string[],
  ): Promise<Chat> => {
    if (socket && status === 'connected') {
      return new Promise((resolve, reject) => {
        socket.emit(
          'create_chat',
          { name: name.trim(), participantIds, isGroup: true },
          (response: { error?: string; chat?: Chat }) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else if (response?.chat) {
              const createdChat = response.chat;
              setChats((prev) => {
                if (prev.some((c) => c.id === createdChat.id)) return prev;
                return [createdChat, ...prev];
              });
              setActiveChatId(createdChat.id);
              resolve(createdChat);
            } else {
              reject(new Error('No se pudo crear el grupo'));
            }
          },
        );
      });
    } else {
      const newChat = await apiRequest<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          participantIds,
          isGroup: true,
        }),
      });
      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev;
        return [newChat, ...prev];
      });
      setActiveChatId(newChat.id);
      return newChat;
    }
  };

  const sendTyping = () => {
    if (!socket || !activeChatId || status !== 'connected') return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { chatId: activeChatId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2500);
  };

  const stopTyping = () => {
    if (!socket || !activeChatId || status !== 'connected') return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing_stop', { chatId: activeChatId });
    }
  };

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
