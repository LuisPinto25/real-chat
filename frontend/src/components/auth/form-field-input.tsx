'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FormFieldInputProps extends InputProps {
  label: string;
  icon?: LucideIcon;
  error?: string;
  isPassword?: boolean;
}

export const FormFieldInput = forwardRef<HTMLInputElement, FormFieldInputProps>(
  (
    {
      label,
      id,
      icon: Icon,
      error,
      isPassword = false,
      type,
      className,
      ...inputProps
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const resolvedType = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold text-foreground block"
          htmlFor={id}
        >
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <Icon
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors',
                error && 'text-red-500 dark:text-red-400',
              )}
            />
          )}

          <Input
            id={id}
            ref={ref}
            type={resolvedType}
            aria-invalid={!!error}
            className={cn(
              'h-10',
              Icon && 'pl-9',
              isPassword && 'pr-9',
              error &&
                'border-red-500 dark:border-red-500 bg-red-500/5 focus-visible:ring-red-500',
              className,
            )}
            {...inputProps}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormFieldInput.displayName = 'FormFieldInput';
