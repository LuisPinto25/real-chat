import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  message?: string | null;
  className?: string;
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        'p-3 rounded-lg bg-red-500/15 dark:bg-red-950/60 border border-red-500/50 dark:border-red-500/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5 font-medium shadow-xs animate-in fade-in',
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
      <span>{message}</span>
    </div>
  );
}
