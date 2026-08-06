'use client';

import { useEffect } from 'react';

/**
 * Fires a conversion event to GTM dataLayer when the thank-you page loads.
 * GTM listens for 'conversion_complete' and fires the Google Ads conversion tag.
 * Belt-and-braces alongside the URL-destination conversion in Google Ads.
 */
export function ThankYouConversion() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.dataLayer) return;

    window.dataLayer.push({
      event: 'conversion_complete',
      conversion_type: 'lead',
      value: 50.0,
      currency: 'GBP',
    });
  }, []);

  return null;
}
