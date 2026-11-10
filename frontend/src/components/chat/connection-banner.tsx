'use client';

import React from 'react';
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
      className={`w-full px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between transition-colors ${
        status === 'connecting'
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-b border-amber-500/30'
          : 'bg-red-500/15 text-red-600 dark:text-red-400 border-b border-red-500/30'
      }`}
    >
      <div className="flex items-center gap-2">
        {status === 'connecting' ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
            <span>Conectando con el servidor en tiempo real...</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 shrink-0" />
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
          className="h-7 px-2.5 text-xs font-semibold hover:bg-red-500/10 border-red-500/30"
        >
          Reconectar
        </Button>
      )}
    </div>
  );
}
