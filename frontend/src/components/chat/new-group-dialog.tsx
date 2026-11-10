'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Users } from 'lucide-react';
import { useChat } from '@/contexts/chat-context';
import { useUsers } from '@/hooks/use-users';
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
import { ErrorAlert } from '@/components/ui/error-alert';
import { GroupParticipantsSelector } from './group-participants-selector';

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewGroupDialog({ open, onOpenChange }: NewGroupDialogProps) {
  const { createGroupChat } = useChat();
  const { filteredUsers, isLoading, search, setSearch } = useUsers(open);

  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setSelectedUserIds([]);
      setErrorMessage(null);
    }
  }, [open]);

  const toggleUserSelection = (userId: string) => {
    setErrorMessage(null);
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = async (e: FormEvent) => {
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

          <ErrorAlert message={errorMessage} className="my-2" />

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

          <GroupParticipantsSelector
            users={filteredUsers}
            selectedUserIds={selectedUserIds}
            isLoading={isLoading}
            disabled={isSubmitting}
            search={search}
            onSearchChange={setSearch}
            onToggleUser={toggleUserSelection}
          />

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
