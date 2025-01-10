'use client';

import { Navigation } from '@/components/layout/Navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation searchQuery="" onSearchChange={() => {}} />
      {children}
    </>
  );
} 