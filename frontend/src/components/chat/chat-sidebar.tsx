'use client';

import { useState, useMemo } from 'react';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useChat } from '@/contexts/chat-context';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserProfileHeader } from './user-profile-header';
import { ConnectionBanner } from './connection-banner';
import { ChatListItem } from './chat-list-item';
import { NewChatDialog } from './new-chat-dialog';

export function ChatSidebar() {
  const { user } = useAuth();
  const { chats, activeChatId, setActiveChatId, isLoadingChats } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const q = searchQuery.toLowerCase().trim();
    return chats.filter((chat) => {
      if (chat.isGroup && chat.name?.toLowerCase().includes(q)) return true;

      const otherUser = chat.participants.find(
        (p) => p.userId !== user?.id,
      )?.user;
      if (otherUser?.name.toLowerCase().includes(q)) return true;
      if (otherUser?.email.toLowerCase().includes(q)) return true;

      if (chat.lastMessage?.content.toLowerCase().includes(q)) return true;

      return false;
    });
  }, [chats, searchQuery, user]);

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r bg-card/60 backdrop-blur-xs select-none shrink-0">
      <UserProfileHeader />
      <ConnectionBanner />

      {/* Search Bar */}
      <div className="p-3 border-b bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar o empezar un nuevo chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/40 focus-visible:ring-emerald-500 rounded-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoadingChats ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
              <MessageSquare className="h-7 w-7" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-sm font-medium">
                  No se encontraron resultados
                </p>
                <p className="text-xs mt-1">
                  Prueba con otro término de búsqueda
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  ¡Aún no tienes chats!
                </p>
                <p className="text-xs mt-1 mb-4">
                  Inicia una conversación con cualquier usuario registrado o
                  crea un grupo.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsNewChatOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Iniciar nuevo chat
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === activeChatId}
                onSelect={() => setActiveChatId(chat.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <NewChatDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
    </aside>
  );
}
