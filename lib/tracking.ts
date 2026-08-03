/**
 * ---------------------------------------------------------------
 * CENTRALIZED EVENT TRACKING (GTM dataLayer)
 *
 * Single source of truth for all conversion and engagement events.
 * This file's responsibility is to push well-structured events and
 * data into the `window.dataLayer`.
 *
 * It is assumed that Google Tag Manager (GTM) is configured to listen
 * for these custom events and fire the appropriate marketing tags
 * (GA4, Google Ads, Meta Pixel, etc.).
 *
 * Event names (pushed to dataLayer):
 *   - quote_request        → successful quote form submission
 *   - contact_form_submit  → successful contact form submission
 *   - phone_click          → any tel: link click
 *   - whatsapp_click       → any WhatsApp link/button click
 * ---------------------------------------------------------------
 */

// --------------- type declarations ---------------

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GADS_CONV_ID = process.env.NEXT_PUBLIC_GADS_CONV_ID || 'AW-17763560213';
// Separate conversion action for low-value engagement clicks (phone/WhatsApp
// taps) so they don't pollute the lead-form conversion data. Create the action
// in Google Ads (Tools → Conversions → "Phone/WhatsApp click") and set its ID
// here / via env. Falls back to the lead-form ID if unset.
const GADS_CLICK_CONV_ID = process.env.NEXT_PUBLIC_GADS_CLICK_CONV_ID || GADS_CONV_ID;

// --------------- click-id capture (Google Ads offline conversions) ---------------

const GCLID_STORAGE_KEY = 'ur_gclid';
const GCLID_TS_KEY = 'ur_gclid_ts';
// Google Ads click ids are valid for offline-conversion upload for 90 days.
const GCLID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Capture the `gclid` (and `gbraid`/`wbraid` for iOS) from the landing URL
 * into localStorage on first touch. Call once on app mount. Subsequent
 * form submissions read it back via getGclid() so the click that drove the
 * lead can be credited when the deal closes offline.
 */
export function captureClickIds() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid') || params.get('gbraid') || params.get('wbraid');
    if (gclid) {
      window.localStorage.setItem(GCLID_STORAGE_KEY, gclid);
      window.localStorage.setItem(GCLID_TS_KEY, String(Date.now()));
    }
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/**
 * Return the stored gclid if it's still within the 90-day attribution
 * window, else null. Read at form-submit time and sent to the API so it
 * can be attached to the GHL contact's custom fields.
 */
export function getGclid(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(GCLID_STORAGE_KEY);
    const ts = Number(window.localStorage.getItem(GCLID_TS_KEY) || 0);
    if (!value) return null;
    if (ts && Date.now() - ts > GCLID_TTL_MS) {
      window.localStorage.removeItem(GCLID_STORAGE_KEY);
      window.localStorage.removeItem(GCLID_TS_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

// --------------- low-level dispatcher ---------------

/**
 * Pushes an event to the `window.dataLayer`.
 * This is the primary function for all tracking events.
 * @param eventName The name of the custom event.
 * @param params Additional data associated with the event.
 */
function sendDataLayerEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined' || !window.dataLayer) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[tracking] dataLayer not found for event: ${eventName}`);
    }
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%c[tracking] Pushing to dataLayer: ${eventName}`,
      'color: #f97316; font-weight: bold;',
      params,
    );
  }

  // Push the event to the dataLayer
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}

/**
 * Fires a Google Ads conversion event directly via gtag.
 * Called after every confirmed form submission so Google Ads
 * registers the lead regardless of GTM tag firing order or
 * consent-mode delays.
 */
function fireGadsConversion(value: number, conversionId: string = GADS_CONV_ID) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value,
    currency: 'GBP',
  });
}

// --------------- public tracking API ---------------

/**
 * Track a successful quote form submission.
 * Call ONLY after the API confirms success.
 */
export function trackQuoteRequest(extra: {
  service_type?: string;
  postcode?: string;
}) {
  sendDataLayerEvent('quote_request', {
    form_name: 'quote_request',
    service_type: extra.service_type,
    postcode: extra.postcode,
    value: 50.0,
    currency: 'GBP',
  });
  fireGadsConversion(50.0);
}

/**
 * Track a successful contact form submission.
 * Call ONLY after the API confirms success.
 */
export function trackContactForm(extra?: {
  subject?: string;
}) {
  sendDataLayerEvent('contact_form_submit', {
    form_name: 'contact_form',
    subject: extra?.subject,
    value: 25.0,
    currency: 'GBP',
  });
  fireGadsConversion(25.0);
}

/**
 * Track a phone link click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackPhoneClick(placement: string) {
  sendDataLayerEvent('phone_click', {
    contact_method: 'phone',
    placement,
    value: 5.0,
    currency: 'GBP',
  });
  fireGadsConversion(5.0, GADS_CLICK_CONV_ID);
}

/**
 * Track a WhatsApp link/button click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackWhatsAppClick(placement: string) {
  sendDataLayerEvent('whatsapp_click', {
    contact_method: 'whatsapp',
    placement,
    value: 5.0,
    currency: 'GBP',
  });
  fireGadsConversion(5.0, GADS_CLICK_CONV_ID);
}

/**
 * Track an email link click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackEmailClick(placement: string) {
  sendDataLayerEvent('email_click', {
    contact_method: 'email',
    placement,
    value: 3.0,
    currency: 'GBP',
  });
}

/**
 * Track when the quote request modal is opened.
 * Fires on dialog open — useful as a funnel entry signal in GTM.
 */
export function trackQuoteFormOpen() {
  sendDataLayerEvent('quote_form_open', {
    form_name: 'quote_request',
  });
}
