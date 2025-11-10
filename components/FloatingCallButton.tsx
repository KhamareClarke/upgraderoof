'use client';

import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingCallButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <Button
        size="lg"
        className="group relative bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-4 py-4 rounded-full shadow-2xl hover:shadow-brand-orange/50 transition-all duration-300 hover:scale-110 active:scale-95"
        asChild
      >
        <a href="tel:07379440583" className="flex items-center justify-center">
          <Phone className="w-6 h-6 group-hover:animate-bounce" />
          <span className="ml-2 font-bold">Call Now</span>
        </a>
      </Button>
    </div>
  );
}
