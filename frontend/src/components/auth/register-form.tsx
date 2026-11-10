'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { FormFieldInput } from './form-field-input';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const { register: registerAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      await registerAuth(data.name.trim(), data.email.trim(), data.password);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Error al registrar la cuenta. Intenta de nuevo.',
      );
    }
  };

  return (
    <>
      <ErrorAlert message={errorMessage} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormFieldInput
          id="name"
          label="Nombre Completo"
          type="text"
          placeholder="Juan Pérez"
          icon={User}
          disabled={isSubmitting}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            required: 'El nombre es obligatorio',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres',
            },
          })}
        />

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
          placeholder="Mínimo 6 caracteres"
          icon={Lock}
          disabled={isSubmitting}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: {
              value: 6,
              message: 'La contraseña debe tener al menos 6 caracteres',
            },
          })}
        />

        <FormFieldInput
          id="confirmPassword"
          label="Confirmar Contraseña"
          isPassword
          placeholder="Repite la contraseña"
          icon={Lock}
          disabled={isSubmitting}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirma tu contraseña',
            validate: (value, formValues) =>
              value === formValues.password || 'Las contraseñas no coinciden',
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
              Registrando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>
      </form>
    </>
  );
}
