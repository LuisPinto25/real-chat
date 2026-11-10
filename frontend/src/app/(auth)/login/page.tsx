'use client';

import { AuthCardLayout } from '@/components/auth/auth-card-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthCardLayout
      title="Bienvenido a RealChat"
      subtitle="Inicia sesión para comunicarte con tus compañeros en tiempo real."
      footerText="¿No tienes una cuenta aún?"
      footerLinkText="Regístrate aquí"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthCardLayout>
  );
}
