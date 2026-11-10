'use client';

import { Search, Check } from 'lucide-react';
import type { User } from '@/types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, stringToColor } from '@/lib/utils';

interface GroupParticipantsSelectorProps {
  users: User[];
  selectedUserIds: string[];
  isLoading: boolean;
  disabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleUser: (userId: string) => void;
}

export function GroupParticipantsSelector({
  users,
  selectedUserIds,
  isLoading,
  disabled = false,
  search,
  onSearchChange,
  onToggleUser,
}: GroupParticipantsSelectorProps) {
  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Añadir participantes
          </span>
          <span className="text-muted-foreground">
            {selectedUserIds.length} seleccionados
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="h-56 border rounded-md p-1 mt-2">
        {isLoading ? (
          <div className="space-y-3 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <p className="text-xs">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {users.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);

              return (
                <div
                  key={u.id}
                  onClick={() => !disabled && onToggleUser(u.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onToggleUser(u.id);
                    }
                  }}
                  className={`w-full px-2.5 py-2 flex items-center justify-between cursor-pointer rounded-md transition-colors ${
                    isSelected ? 'bg-emerald-500/10' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar || undefined} alt={u.name} />
                      <AvatarFallback
                        className="text-white text-xs font-semibold"
                        style={{ backgroundColor: stringToColor(u.name) }}
                      >
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-muted-foreground/30 bg-background'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
