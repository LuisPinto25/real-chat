'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ConnectionStatus, User } from '@/types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useSocketConnection(user: User | null, token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setStatus('disconnected');
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setStatus('connecting');

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => setStatus('connected'));
    newSocket.on('disconnect', () => setStatus('disconnected'));
    newSocket.on('connect_error', () => setStatus('disconnected'));

    newSocket.on('online_users', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    newSocket.on(
      'user_status',
      ({
        userId,
        status: userStatus,
      }: {
        userId: string;
        status: 'online' | 'offline';
      }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (userStatus === 'online') {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      },
    );

    setSocket(newSocket);
  }, [token, user]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  return {
    socket,
    status,
    onlineUsers,
    reconnect: connectSocket,
  };
}
