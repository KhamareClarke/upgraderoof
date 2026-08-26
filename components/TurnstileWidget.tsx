'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget.
 *
 * Env-gated: renders nothing (and returns null to parents) when
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so any environment without a site
 * key carries on as before.
 *
 * The `<TurnstileProvider>` below loads the shared script exactly once; this
 * component renders an individual widget and reports the token back via
 * `onToken`. The token is one-shot — after the token is consumed (or the form
 * resets), the parent should call `reset()` via the `widgetId`.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWindow = {
  turnstile?: {
    render: (el: HTMLElement, opts: unknown) => string;
    remove: (id: string) => void;
    reset: (id: string) => void;
  };
};

declare global {
  interface Window { turnstile?: TurnstileWindow['turnstile']; }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      if (window.turnstile) return resolve();
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => resolve(); // degrade gracefully — no CAPTCHA
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    let cancelled = false;

    loadScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
      });
    });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="mt-2" />;
}
