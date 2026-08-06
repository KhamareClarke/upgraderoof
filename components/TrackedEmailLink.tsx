'use client';

import { trackEmailClick } from '@/lib/tracking';

interface TrackedEmailLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  placement: string;
}

export function TrackedEmailLink({ href, placement, onClick, children, ...props }: TrackedEmailLinkProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        trackEmailClick(placement);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
