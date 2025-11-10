'use client';

import { Phone, MessageCircle, Mail } from 'lucide-react';

export function MobileContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-3 px-4">
        <a
          href="tel:07379440583"
          className="flex flex-col items-center gap-1 text-brand-navy hover:text-brand-orange transition-colors group"
          aria-label="Call us"
        >
          <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
            <Phone className="w-5 h-5 text-brand-orange" />
          </div>
          <span className="text-xs font-medium">Call</span>
        </a>
        
        <a
          href="https://wa.me/447379440583"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-brand-navy hover:text-green-500 transition-colors group"
          aria-label="Contact us on WhatsApp"
        >
          <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <MessageCircle className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
        
        <a
          href="mailto:info@upgraderoofing.co.uk"
          className="flex flex-col items-center gap-1 text-brand-navy hover:text-blue-500 transition-colors group"
          aria-label="Email us"
        >
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xs font-medium">Email</span>
        </a>
      </div>
    </div>
  );
}
