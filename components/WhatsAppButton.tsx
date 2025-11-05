'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '447379440583';
  const message = 'Hi, I would like to enquire about your roofing services.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Contact us on WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 group-hover:rotate-12">
          <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </div>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl">
        Chat with us on WhatsApp
        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-brand-navy transform rotate-45"></div>
      </div>
    </button>
  );
}