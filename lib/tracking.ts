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

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-7V452FMYFY';
const GADS_CONV_ID = process.env.NEXT_PUBLIC_GADS_CONV_ID || 'AW-17763560213';
// Separate conversion action for low-value engagement clicks (phone/WhatsApp
// taps) so they don't pollute the lead-form conversion data. Create the action
// in Google Ads (Tools → Conversions → "Phone/WhatsApp click") and set its ID
// here / via env.
// IMPORTANT: we deliberately do NOT fall back to GADS_CONV_ID. If a dedicated
// click-conversion ID is not configured, telephone/WhatsApp taps send nothing
// to Google Ads rather than mislabelling a £5 tap as a full lead-form (£50/£25)
// conversion, which previously polluted bid-optimisation signals.
const GADS_CLICK_CONV_ID = process.env.NEXT_PUBLIC_GADS_CLICK_CONV_ID || null;

// --------------- click-id capture (Google Ads offline conversions) ---------------

const GCLID_STORAGE_KEY = 'ur_gclid';
const GCLID_TS_KEY = 'ur_gclid_ts';
// Google Ads click ids are valid for offline-conversion upload for 90 days.
const GCLID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// Anti-honeypot timestamp stamp. Stamped once when the page first renders (not
// at submit), the server rejects any submission claiming to arrive in under
// MIN_SUBMIT_MS (see lib/lead-validation) — bots fire instantly, humans don't.
let _pageStamp: number | null = null;
export function getSubmitStamp(): number | null {
  if (typeof window === 'undefined') return null;
  if (_pageStamp === null) _pageStamp = Date.now();
  return _pageStamp;
}

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

/**
 * Fires an event to GA4 directly via gtag, independent of GTM.
 *
 * GA4 page_views are handled by Analytics.tsx's config tag, but custom
 * conversions (quote_request, contact_form_submit, clicks) previously ONLY
 * reached GA4 through GTM container tags listening on dataLayer custom events.
 * If those GTM tags/triggers are missing or misconfigured, events fire in the
 * browser yet never transmit to GA4 ("events = 0 in GA4" while Google Ads
 * offline conversions still show data, since Ads fires via gtag directly).
 *
 * `gtag('event', name, {...})` sends to every config already loaded — the GA4
 * config (G-7V452FMYFY) is loaded by Analytics.tsx, so this reaches GA4 without
 * any GTM dependency. If the GTM container is later fixed to also send these
 * events, disable the duplicate tag in GTM (or drop this call) to avoid
 * double-counting. The free GA4_ID const is defined for parity with the Ads path.
 */
function fireGa4Event(eventName: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
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
  const params = {
    form_name: 'quote_request',
    service_type: extra.service_type,
    postcode: extra.postcode,
    value: 50.0,
    currency: 'GBP',
  };
  sendDataLayerEvent('quote_request', params);
  fireGa4Event('quote_request', params);
  fireGadsConversion(50.0);
}

/**
 * Track a successful contact form submission.
 * Call ONLY after the API confirms success.
 */
export function trackContactForm(extra?: {
  subject?: string;
}) {
  const params = {
    form_name: 'contact_form',
    subject: extra?.subject,
    value: 25.0,
    currency: 'GBP',
  };
  sendDataLayerEvent('contact_form_submit', params);
  fireGa4Event('contact_form_submit', params);
  fireGadsConversion(25.0);
}

/**
 * Track a phone link click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackPhoneClick(placement: string) {
  const params = {
    contact_method: 'phone',
    placement,
    value: 5.0,
    currency: 'GBP',
  };
  sendDataLayerEvent('phone_click', params);
  fireGa4Event('phone_click', params);
  // Only send the engagement tap to Google Ads if a dedicated click-conversion
  // action is configured; otherwise skip the gtag event so we don't miscount a
  // tap as a lead-form conversion.
  if (GADS_CLICK_CONV_ID) fireGadsConversion(5.0, GADS_CLICK_CONV_ID);
}

/**
 * Track a WhatsApp link/button click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackWhatsAppClick(placement: string) {
  const params = {
    contact_method: 'whatsapp',
    placement,
    value: 5.0,
    currency: 'GBP',
  };
  sendDataLayerEvent('whatsapp_click', params);
  fireGa4Event('whatsapp_click', params);
  // Only send the engagement tap to Google Ads if a dedicated click-conversion
  // action is configured; otherwise skip the gtag event so we don't miscount a
  // tap as a lead-form conversion.
  if (GADS_CLICK_CONV_ID) fireGadsConversion(5.0, GADS_CLICK_CONV_ID);
}

/**
 * Track an email link click.
 * Safe to call from onClick — does NOT prevent navigation.
 */
export function trackEmailClick(placement: string) {
  const params = {
    contact_method: 'email',
    placement,
    value: 3.0,
    currency: 'GBP',
  };
  sendDataLayerEvent('email_click', params);
  fireGa4Event('email_click', params);
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
