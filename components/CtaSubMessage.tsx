interface CtaSubMessageProps {
  dark?: boolean;
  className?: string;
}

export function CtaSubMessage({ dark = false, className = '' }: CtaSubMessageProps) {
  return (
    <p className={`text-xs text-center leading-relaxed ${dark ? 'text-white/60' : 'text-gray-600'} ${className}`}>
      ✓ Free inspection · ✓ No obligation · ✓ 10-min callback
    </p>
  );
}
