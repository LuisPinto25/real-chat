'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: ReactNode;
}

export function AuthCardLayout({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthCardLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-3 shadow-md shadow-emerald-600/30">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>

        {children}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {footerText}{' '}
          <Link
            href={footerLinkHref}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            {footerLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
