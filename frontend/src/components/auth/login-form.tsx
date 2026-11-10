'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { FormFieldInput } from './form-field-input';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      await login(data.email.trim(), data.password);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas. Verifica tu correo y contraseña.',
      );
    }
  };

  return (
    <>
      <ErrorAlert message={errorMessage} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormFieldInput
          id="email"
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@acema.com"
          icon={Mail}
          disabled={isSubmitting}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'El correo electrónico es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Ingresa un correo electrónico válido',
            },
          })}
        />

        <FormFieldInput
          id="password"
          label="Contraseña"
          isPassword
          placeholder="••••••••"
          icon={Lock}
          disabled={isSubmitting}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'La contraseña es obligatoria',
          })}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </>
  );
}
