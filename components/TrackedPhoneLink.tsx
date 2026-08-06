'use client';

import { trackPhoneClick } from '@/lib/tracking';
import { PHONE_TEL } from '@/lib/contact';

interface TrackedPhoneLinkProps {
  /** Defaults to the central business line (lib/contact PHONE_TEL). */
  href?: string;
  placement: string;
  children: React.ReactNode;
  className?: string;
}

export function TrackedPhoneLink({ href = PHONE_TEL, placement, children, className }: TrackedPhoneLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackPhoneClick(placement)}
    >
      {children}
    </a>
  );
}
