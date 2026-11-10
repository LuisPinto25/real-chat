'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Users, Smile, ShieldAlert } from 'lucide-react';
import { useChat } from '@/contexts/chat-context';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials, stringToColor } from '@/lib/utils';
import { MessageBubble } from './message-bubble';

export function ChatWindow() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const {
    activeChat,
    messages,
    isLoadingMessages,
    setActiveChatId,
    sendMessage,
    sendTyping,
    stopTyping,
    typingMap,
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeChat) {
    return (
      <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/20 text-muted-foreground p-6 text-center select-none">
        <div className="max-w-md flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            WhatsApp Web / Real Chat
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Envía y recibe mensajes en tiempo real de forma segura. Selecciona
            una conversación del panel izquierdo o inicia una nueva con
            cualquier usuario registrado.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border">
            <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Cifrado de extremo a extremo & comunicación por WebSockets
            </span>
          </div>
        </div>
      </main>
    );
  }

  const isGroup = activeChat.isGroup;
  const otherParticipant = activeChat.participants.find(
    (p) => p.userId !== user?.id,
  );
  const otherUser = otherParticipant?.user;

  const chatTitle = isGroup
    ? activeChat.name || 'Grupo'
    : otherUser?.name || 'Usuario';

  const isDirectOnline = !isGroup && otherUser && onlineUsers.has(otherUser.id);
  const typingUser = typingMap[activeChat.id];

  const participantNames = isGroup
    ? activeChat.participants
        .map((p) => (p.userId === user?.id ? 'Tú' : p.user?.name || 'Usuario'))
        .join(', ')
    : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);
    sendTyping();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending) return;

    try {
      setIsSending(true);
      const text = inputContent;
      setInputContent('');
      await sendMessage(text);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const avatarColor = stringToColor(chatTitle);

  return (
    <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Chat Header */}
      <header className="h-16 px-4 bg-muted/40 border-b flex items-center justify-between select-none shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveChatId(null)}
            className="md:hidden h-8 w-8 text-muted-foreground mr-1"
            aria-label="Volver a chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Avatar */}
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

          {/* Header Info */}
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
                {activeChat.participants.length} miembros: {participantNames}
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

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-muted/20 via-background to-background">
        {isLoadingMessages ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <Skeleton
                  className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
              <Smile className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              ¡Comienza la conversación!
            </p>
            <p className="text-xs mt-1 max-w-xs">
              Envía el primer mensaje para empezar a chatear en tiempo real con{' '}
              {chatTitle}.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === user?.id}
                isGroup={isGroup}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input Bar */}
      <footer className="p-3 bg-muted/30 border-t shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <Input
            placeholder="Escribe un mensaje..."
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1 h-11 bg-background border-border/80 focus-visible:ring-emerald-500 rounded-full px-4 text-sm"
          />

          <Button
            type="submit"
            disabled={!inputContent.trim() || isSending}
            size="icon"
            className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-40"
            title="Enviar mensaje"
            aria-label="Enviar mensaje"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </main>
  );
}
