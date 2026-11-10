'use client';

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputBarProps {
  onSendMessage: (content: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
}

export function ChatInputBar({
  onSendMessage,
  onTyping,
  onStopTyping,
}: ChatInputBarProps) {
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);
    onTyping();
  };

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending) return;

    try {
      setIsSending(true);
      const text = inputContent;
      setInputContent('');
      await onSendMessage(text);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
      onStopTyping();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
  );
}
