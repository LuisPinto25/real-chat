'use client';

import { useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { useChat } from '@/contexts/chat-context';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { ChatEmptyState } from './chat-empty-state';
import { ChatHeader } from './chat-header';
import { ChatInputBar } from './chat-input-bar';

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return <ChatEmptyState />;
  }

  const isGroup = activeChat.isGroup;
  const otherParticipant = activeChat.participants.find(
    (p) => p.userId !== user?.id,
  );
  const otherUser = otherParticipant?.user;

  const chatTitle = isGroup
    ? activeChat.name || 'Grupo'
    : otherUser?.name || 'Usuario';

  const isDirectOnline = Boolean(
    !isGroup && otherUser && onlineUsers.has(otherUser.id),
  );
  const typingUser = typingMap[activeChat.id];

  return (
    <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <ChatHeader
        chat={activeChat}
        currentUser={user}
        chatTitle={chatTitle}
        isDirectOnline={isDirectOnline}
        typingUser={typingUser}
        onBack={() => setActiveChatId(null)}
      />

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

      <ChatInputBar
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        onStopTyping={stopTyping}
      />
    </main>
  );
}
