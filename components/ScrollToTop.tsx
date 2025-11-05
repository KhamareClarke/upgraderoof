'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-6 z-40 group"
      aria-label="Scroll to top"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-brand-orange rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        <div className="relative w-14 h-14 bg-gradient-to-br from-brand-navy to-brand-navy/80 hover:from-brand-orange hover:to-orange-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/10">
          <ArrowUp className="w-6 h-6 text-white group-hover:animate-bounce" strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );
}