'use client';

import { RefreshCw, WifiOff } from 'lucide-react';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';

export function ConnectionBanner() {
  const { status, reconnect } = useSocket();

  if (status === 'connected') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full px-4 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between transition-colors ${
        status === 'connecting'
          ? 'bg-amber-500/15 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-b border-amber-500/40'
          : 'bg-red-500/15 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-b border-red-500/50'
      }`}
    >
      <div className="flex items-center gap-2">
        {status === 'connecting' ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Conectando con el servidor en tiempo real...</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>
              Sin conexión con el servidor. Los mensajes pueden no actualizarse
              en vivo.
            </span>
          </>
        )}
      </div>

      {status === 'disconnected' && (
        <Button
          variant="outline"
          size="sm"
          onClick={reconnect}
          className="h-7 px-2.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-500/20 border-red-500/50"
        >
          Reconectar
        </Button>
      )}
    </div>
  );
}
