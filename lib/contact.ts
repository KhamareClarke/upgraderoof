/**
 * lib/contact.ts
 *
 * Single source of truth for the business's clickable contact channels.
 *
 * Centralized so that:
 *  - Google's call-tracking number swap (forwarding number) has a consistent
 *    tel: target to find and replace on ad traffic.
 *  - GHL number routing only needs one place updated if the tracking number
 *    changes.
 *  - Every tracked phone/WhatsApp link uses the same href format.
 *
 * Displayed number vs. dial link differ in format:
 *  - PHONE_DISPLAY  human-readable, shown on screen
 *  - PHONE_TEL      E.164-ish digits-only for the tel: href
 *  - WHATSAPP_WA    digits-only international for the wa.me href
 */

export const PHONE_DISPLAY = '01270 897 606';
export const PHONE_TEL = 'tel:01270897606';

export const WHATSAPP_DISPLAY = 'WhatsApp';
export const WHATSAPP_NUMBER = '447379440583';
export const WHATSAPP_WA = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Google Business Profile review-write URL (opens the "leave a review" prompt). */
export const GOOGLE_REVIEW_URL =
  'https://www.google.com/maps/place/Upgrade+Roofs?hl=en-GB';
