'use client';

import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Message } from '@/types';
import { formatMessageTime } from '@/lib/formatters';
import { stringToColor } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isGroup: boolean;
}

export function MessageBubble({
  message,
  isMine,
  isGroup,
}: MessageBubbleProps) {
  const senderName = message.sender?.name || 'Usuario';
  const nameColor = stringToColor(senderName);

  return (
    <div
      className={`flex w-full my-1 px-4 ${
        isMine ? 'justify-end' : 'justify-start'
      } animate-in fade-in duration-200`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-3.5 py-2 shadow-xs transition-shadow ${
          isMine
            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs'
            : 'bg-card text-card-foreground border border-border/60 rounded-2xl rounded-tl-xs shadow-xs'
        }`}
      >
        {!isMine && isGroup && (
          <p
            className="text-xs font-bold mb-1 leading-none"
            style={{ color: nameColor }}
          >
            {senderName}
          </p>
        )}

        <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
          {message.content}
        </p>

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
            isMine ? 'text-emerald-100' : 'text-muted-foreground'
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isMine && <CheckCheck className="h-3.5 w-3.5 text-emerald-200" />}
        </div>
      </div>
    </div>
  );
}
