'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Check, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { apiRequest } from '@/lib/api';
import { useChat } from '@/contexts/chat-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, stringToColor } from '@/lib/utils';

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewGroupDialog({ open, onOpenChange }: NewGroupDialogProps) {
  const { createGroupChat } = useChat();

  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setSelectedUserIds([]);
      setSearch('');
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    apiRequest<User[]>('/users')
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err))
      .finally(() => setIsLoading(false));
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const toggleUserSelection = (userId: string) => {
    setErrorMessage(null);
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMessage('Por favor ingresa un nombre para el grupo.');
      return;
    }

    if (selectedUserIds.length === 0) {
      setErrorMessage(
        'Debes seleccionar al menos un participante para el grupo.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createGroupChat(groupName.trim(), selectedUserIds);
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al crear el grupo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCreateGroup}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Crear nuevo grupo</span>
            </DialogTitle>
            <DialogDescription>
              Solo los miembros agregados a este grupo podrán recibir y enviar
              mensajes.
            </DialogDescription>
          </DialogHeader>

          {/* Error Message */}
          {errorMessage && (
            <div className="my-2 p-2.5 rounded-md bg-destructive/15 text-destructive text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Group Name Input */}
          <div className="my-3 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nombre del grupo *
            </label>
            <Input
              placeholder="Ej: Equipo de Proyecto, Familia, Amigos..."
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Search participants */}
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
                onChange={(e) => setSearch(e.target.value)}
                disabled={isSubmitting}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* User selection list */}
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
            ) : filteredUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <p className="text-xs">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);

                  return (
                    <div
                      key={u.id}
                      onClick={() => !isSubmitting && toggleUserSelection(u.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      className={`w-full px-2.5 py-2 flex items-center justify-between cursor-pointer rounded-md transition-colors ${
                        isSelected ? 'bg-emerald-500/10' : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={u.avatar || undefined}
                            alt={u.name}
                          />
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
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 stroke-3" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                isSubmitting ||
                !groupName.trim() ||
                selectedUserIds.length === 0
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? 'Creando grupo...' : 'Crear Grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
