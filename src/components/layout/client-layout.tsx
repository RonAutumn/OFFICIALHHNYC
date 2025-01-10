'use client';

import { Header } from '@/components/header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
} 