'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus } from '@/types';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  status: ConnectionStatus;
  onlineUsers: Set<string>;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
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

    newSocket.on('connect', () => {
      setStatus('connected');
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
      setStatus('disconnected');
    });

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

  const reconnect = useCallback(() => {
    connectSocket();
  }, [connectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        status,
        onlineUsers,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
