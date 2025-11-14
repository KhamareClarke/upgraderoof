'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSpecialOffer = pathname === '/special-offer';

  return (
    <>
      {!isSpecialOffer && <Header />}
      <main>{children}</main>
      {!isSpecialOffer && <Footer />}
    </>
  );
}

