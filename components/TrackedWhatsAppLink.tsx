'use client';

import { trackWhatsAppClick } from '@/lib/tracking';
import { WHATSAPP_WA } from '@/lib/contact';

interface TrackedWhatsAppLinkProps {
  /** Defaults to the central WhatsApp number (lib/contact WHATSAPP_WA). */
  href?: string;
  placement: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function TrackedWhatsAppLink({ href = WHATSAPP_WA, placement, children, className, target, rel }: TrackedWhatsAppLinkProps) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => trackWhatsAppClick(placement)}
    >
      {children}
    </a>
  );
}
