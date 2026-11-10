'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import type { ConnectionStatus } from '@/types';
import { useAuth } from './auth-context';
import { useSocketConnection } from '@/hooks/use-socket-connection';

interface SocketContextType {
  socket: Socket | null;
  status: ConnectionStatus;
  onlineUsers: Set<string>;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const { socket, status, onlineUsers, reconnect } = useSocketConnection(
    user,
    token,
  );

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
