'use client';

import { MessageCircle } from 'lucide-react';

export function MobileContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-center py-3 px-4">
        <a
          href="https://wa.me/447379440583"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-brand-navy hover:text-green-500 transition-colors group"
          aria-label="Contact us on WhatsApp"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-green-500" />
          </div>
        </a>
      </div>
    </div>
  );
}
