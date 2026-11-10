'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { User } from '@/types';
import { apiRequest } from '@/lib/api';
import { useSocket } from '@/contexts/socket-context';
import { useChat } from '@/contexts/chat-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, stringToColor } from '@/lib/utils';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const { onlineUsers } = useSocket();
  const { createDirectChat } = useChat();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    apiRequest<User[]>('/users')
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err))
      .finally(() => setIsLoading(false));
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleSelectUser = async (targetUserId: string) => {
    try {
      setIsStartingChat(targetUserId);
      await createDirectChat(targetUserId);
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating direct chat:', err);
    } finally {
      setIsStartingChat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <span>Iniciar nueva conversación</span>
          </DialogTitle>
          <DialogDescription>
            Selecciona a cualquier usuario registrado para comenzar a chatear en
            tiempo real.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative my-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users list */}
        <ScrollArea className="h-72 border rounded-md p-1">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No se encontraron usuarios</p>
              <p className="text-xs mt-1">
                {search
                  ? 'Intenta con otro término'
                  : 'No hay otros usuarios registrados aún'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredUsers.map((u) => {
                const isOnline = onlineUsers.has(u.id);
                const isProcessing = isStartingChat === u.id;

                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={u.avatar || undefined}
                            alt={u.name}
                          />
                          <AvatarFallback
                            className="text-white font-semibold"
                            style={{ backgroundColor: stringToColor(u.name) }}
                          >
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"
                            title="En línea"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-foreground leading-tight">
                          {u.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs shrink-0 ml-2">
                      {isOnline ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          En línea
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Desconectado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
