'use client';

import { AuthCardLayout } from '@/components/auth/auth-card-layout';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthCardLayout
      title="Crear una Cuenta"
      subtitle="Únete a la plataforma para chatear en tiempo real."
      footerText="¿Ya tienes una cuenta?"
      footerLinkText="Inicia sesión aquí"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthCardLayout>
  );
}
