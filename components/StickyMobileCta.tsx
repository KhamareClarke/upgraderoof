'use client';

import { trackPhoneClick, trackWhatsAppClick } from '@/lib/tracking';

/**
 * Fixed bottom Call / WhatsApp / Quick Form bar shown only on mobile, matching
 * the special-offer page. "Quick Form" scrolls to the inline lead form.
 */
export function StickyMobileCta({ placement }: { placement: string }) {
  const scrollToForm = () => {
    document.getElementById('inline-lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-lg p-3">
      <div className="flex gap-2">
        <a
          href="tel:01270897606"
          onClick={() => trackPhoneClick(placement)}
          className="flex-1 bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold text-sm py-4 px-3 rounded-md text-center animate-pulse flex items-center justify-center"
        >
          📞 CALL NOW
        </a>
        <a
          href="https://wa.me/447379440583"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(placement)}
          className="bg-green-500 hover:bg-green-600 !text-white font-bold px-3 py-4 text-xs whitespace-nowrap rounded-md flex items-center justify-center gap-1"
        >
          <span>💬</span>
          <span className="!text-white">WhatsApp</span>
        </a>
        <button
          onClick={scrollToForm}
          className="bg-blue-500 hover:bg-blue-600 !text-white font-bold px-3 py-4 text-xs whitespace-nowrap rounded-md flex items-center justify-center gap-1"
        >
          <span>📝</span>
          <span className="!text-white">Quick Form</span>
        </button>
      </div>
    </div>
  );
}
