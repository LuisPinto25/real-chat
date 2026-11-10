'use client';

import { ArrowLeft, Users } from 'lucide-react';
import type { Chat, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials, stringToColor } from '@/lib/utils';

interface ChatHeaderProps {
  chat: Chat;
  currentUser: User | null;
  chatTitle: string;
  isDirectOnline: boolean;
  typingUser?: string;
  onBack: () => void;
}

export function ChatHeader({
  chat,
  currentUser,
  chatTitle,
  isDirectOnline,
  typingUser,
  onBack,
}: ChatHeaderProps) {
  const isGroup = chat.isGroup;
  const otherParticipant = chat.participants.find(
    (p) => p.userId !== currentUser?.id,
  );
  const otherUser = otherParticipant?.user;

  const participantNames = isGroup
    ? chat.participants
        .map((p) =>
          p.userId === currentUser?.id ? 'Tú' : p.user?.name || 'Usuario',
        )
        .join(', ')
    : null;

  const avatarColor = stringToColor(chatTitle);

  return (
    <header className="h-16 px-4 bg-muted/40 border-b flex items-center justify-between select-none shrink-0 z-10 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden h-8 w-8 text-muted-foreground mr-1"
          aria-label="Volver a chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 border shadow-xs">
            {isGroup ? (
              <AvatarFallback
                className="text-white font-bold"
                style={{ backgroundColor: avatarColor }}
              >
                <Users className="h-5 w-5" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage
                  src={otherUser?.avatar || undefined}
                  alt={chatTitle}
                />
                <AvatarFallback
                  className="text-white font-semibold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(chatTitle)}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {isDirectOnline && (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"
              title="En línea"
            />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate leading-tight text-foreground">
            {chatTitle}
          </h2>

          {typingUser ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse truncate">
              {typingUser} está escribiendo...
            </p>
          ) : isGroup ? (
            <p
              className="text-xs text-muted-foreground truncate"
              title={participantNames || ''}
            >
              {chat.participants.length} miembros: {participantNames}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground truncate">
              {isDirectOnline ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  En línea
                </span>
              ) : (
                'Desconectado'
              )}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
