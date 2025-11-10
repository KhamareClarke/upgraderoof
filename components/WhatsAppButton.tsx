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
      className="hidden md:flex fixed bottom-6 right-6 z-50 group"
      aria-label="Contact us on WhatsApp"
    >
      <div className="relative">
        <div className="relative w-12 h-12 md:w-14 md:h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-110">
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2} />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
          <span className="text-[8px] md:text-[10px] font-bold text-white">1</span>
        </div>
      </div>
    </button>
  );
}