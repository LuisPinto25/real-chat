'use client';

import { Users } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/20 text-muted-foreground p-6 text-center select-none">
      <div className="max-w-md flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
          <Users className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Real Chat</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Envía y recibe mensajes en tiempo real de forma segura. Selecciona una
          conversación del panel izquierdo o inicia una nueva con cualquier
          usuario registrado.
        </p>
      </div>
    </main>
  );
}
