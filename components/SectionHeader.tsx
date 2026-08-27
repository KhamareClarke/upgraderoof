import { type ReactNode } from 'react';

interface SectionHeaderProps {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}

export function SectionHeader({ kicker, title, subtitle, align = 'center', dark = false, className = '' }: SectionHeaderProps) {
  const isCenter = align === 'center';
  return (
    <div className={`${isCenter ? 'text-center' : 'text-left'} mb-8 sm:mb-10 md:mb-12 ${className}`}>
      <div className={`inline-flex items-center gap-3 mb-4 ${isCenter ? '' : ''}`}>
        <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
        <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">{kicker}</span>
        <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
      </div>
      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${dark ? 'text-white' : 'text-brand-navy'} mb-3 sm:mb-4 px-2`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-sm sm:text-base md:text-lg ${dark ? 'text-gray-300' : 'text-gray-600'} ${isCenter ? 'max-w-2xl mx-auto' : ''} px-4`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
