'use client';

import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('./WhatsAppButton').then(m => m.WhatsAppButton), { ssr: false });
const ScrollToTop = dynamic(() => import('./ScrollToTop').then(m => m.ScrollToTop), { ssr: false });
const MobileContactBar = dynamic(() => import('./MobileContactBar').then(m => m.MobileContactBar), { ssr: false });
const CookieConsent = dynamic(() => import('./CookieConsent').then(m => m.CookieConsent), { ssr: false });

export function ClientWidgets() {
  return (
    <>
      <WhatsAppButton />
      <MobileContactBar />
      <ScrollToTop />
      <CookieConsent />
    </>
  );
}
