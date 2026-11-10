'use client';

import { useAuth } from '@/contexts/auth-context';
import { ChatProvider, useChat } from '@/contexts/chat-context';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatWindow } from '@/components/chat/chat-window';

function ChatAppLayout() {
  const { activeChatId } = useChat();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">
      <div
        className={`h-full ${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}
      >
        <ChatSidebar />
      </div>

      <div
        className={`h-full flex-1 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}
      >
        <ChatWindow />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Cargando conversaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <ChatAppLayout />
    </ChatProvider>
  );
}
