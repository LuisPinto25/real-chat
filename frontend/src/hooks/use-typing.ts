'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { ConnectionStatus } from '@/types';

interface UseTypingOptions {
  socket: Socket | null;
  status: ConnectionStatus;
  activeChatId: string | null;
}

export function useTyping({ socket, status, activeChatId }: UseTypingOptions) {
  const [typingMap, setTypingMap] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const stopTyping = useCallback(() => {
    if (!socket || !activeChatId || status !== 'connected') return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing_stop', { chatId: activeChatId });
    }
  }, [socket, activeChatId, status]);

  const sendTyping = useCallback(() => {
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
  }, [socket, activeChatId, status, stopTyping]);

  useEffect(() => {
    if (!socket) return;

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

    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket]);

  return {
    typingMap,
    sendTyping,
    stopTyping,
  };
}
