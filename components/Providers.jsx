'use client';

import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
