'use client';

import React, { useState } from 'react';
import { LogOut, MessageSquarePlus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { getInitials } from '@/lib/utils';
import { NewChatDialog } from './new-chat-dialog';
import { NewGroupDialog } from './new-group-dialog';

export function UserProfileHeader() {
  const { user, logout } = useAuth();
  const { status } = useSocket();

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="h-16 px-4 bg-muted/40 border-b flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar className="h-10 w-10 border shadow-xs">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                status === 'connected'
                  ? 'bg-emerald-500'
                  : 'bg-muted-foreground'
              }`}
              title={status === 'connected' ? 'Conectado' : 'Desconectado'}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate leading-tight flex items-center gap-1.5">
              <span>{user.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewChatOpen(true)}
            title="Nuevo chat directo"
            aria-label="Nuevo chat"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewGroupOpen(true)}
            title="Crear nuevo grupo"
            aria-label="Crear grupo"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Users className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <NewChatDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
      <NewGroupDialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen} />
    </>
  );
}
