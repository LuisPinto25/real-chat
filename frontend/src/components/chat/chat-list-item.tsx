'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Chat } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { useChat } from '@/contexts/chat-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, stringToColor } from '@/lib/utils';
import { formatChatListItemDate } from '@/lib/formatters';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
}

export function ChatListItem({
  chat,
  isSelected,
  onSelect,
}: ChatListItemProps) {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { typingMap } = useChat();

  const isGroup = chat.isGroup;
  const otherParticipant = chat.participants.find((p) => p.userId !== user?.id);
  const otherUser = otherParticipant?.user;

  const chatTitle = isGroup
    ? chat.name || 'Grupo sin nombre'
    : otherUser?.name || 'Usuario desconocido';

  const isDirectOnline = !isGroup && otherUser && onlineUsers.has(otherUser.id);

  const typingUser = typingMap[chat.id];

  const lastMsg = chat.lastMessage;
  let lastMessageText = 'Conversación iniciada';
  if (lastMsg) {
    const isMine = lastMsg.senderId === user?.id;
    const prefix = isMine
      ? 'Tú: '
      : isGroup && lastMsg.senderName
        ? `${lastMsg.senderName}: `
        : '';
    lastMessageText = `${prefix}${lastMsg.content}`;
  }

  const avatarColor = stringToColor(chatTitle);

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
      className={`w-full px-3 py-3 flex items-center gap-3 cursor-pointer select-none transition-all duration-150 border-b border-border/40 hover:bg-accent/60 ${
        isSelected ? 'bg-accent/80 font-medium' : 'bg-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 border shadow-xs">
          {isGroup ? (
            <AvatarFallback
              className="text-white font-bold"
              style={{ backgroundColor: avatarColor }}
            >
              <Users className="h-6 w-6" />
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
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background"
            title="En línea"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold truncate text-foreground leading-tight">
            {chatTitle}
          </h3>
          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
            {chat.lastMessage?.createdAt
              ? formatChatListItemDate(chat.lastMessage.createdAt)
              : ''}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {typingUser ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium italic animate-pulse truncate">
              {typingUser} está escribiendo...
            </span>
          ) : (
            <p className="truncate pr-1 text-muted-foreground/90">
              {lastMessageText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
