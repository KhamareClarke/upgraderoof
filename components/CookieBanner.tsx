'use client';

/**
 * CookieBanner — Google Consent Mode V2
 *
 * The Analytics component sets every storage signal to 'denied' by default.
 * Until the visitor makes a choice here, GA4/Ads stay blind. On accept we
 * update all four signals to 'granted'; on reject we keep them denied but
 * record the choice so the banner doesn't re-appear.
 *
 * The choice persists in localStorage and is re-applied on every load via
 * gtag('consent', 'update') so GTM/GA4 always receive the current state.
 */

import React, { useEffect, useState } from 'react';

const CONSENT_KEY = 'ur_consent_choice'; // 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function applyConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    // gtag is defined by the Analytics consent-mode script; define a shim if absent
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
  const state = granted ? 'granted' : 'denied';
  window.gtag('consent', 'update', {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
  window.dataLayer.push({
    event: 'consent_update',
    consent_state: state,
  });
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let choice: string | null = null;
    try {
      choice = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      choice = null;
    }

    if (choice === 'granted') {
      applyConsent(true);
    } else if (choice === 'denied') {
      applyConsent(false);
    } else {
      // No prior choice — show the banner
      setVisible(true);
    }
  }, []);

  const decide = (granted: boolean) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    } catch {
      // storage unavailable (private mode) — still apply consent for this session
    }
    applyConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-xl bg-brand-navy text-white shadow-2xl border border-white/10">
        <div className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm sm:text-base font-semibold mb-1">
              We use cookies
            </p>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              We use cookies to improve your experience and to measure our
              marketing. Accept to help us understand how you use the site, or
              reject to continue with essential cookies only. See our{' '}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-brand-orange"
              >
                privacy policy
              </a>
              .
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <button
              type="button"
              onClick={() => decide(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-white/25 text-white/90 hover:bg-white/10 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => decide(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:opacity-90 text-white transition-opacity"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
