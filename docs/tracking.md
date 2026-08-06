# Tracking Setup & Testing Guide

> **Source of truth for event helpers:** `lib/tracking.ts`
> **Source of truth for tag initialization:** `components/Analytics.tsx`

---

## Architecture

```
components/Analytics.tsx       → Tag initialization ONLY (Consent Mode, GTM, GA4, Google Ads, Meta Pixel)
lib/tracking.ts                → ALL event helper functions (single source of truth)
components/TrackedPhoneLink    → Reusable client wrapper for tel: links (used in server components)
components/TrackedWhatsAppLink → Reusable client wrapper for wa.me links (used in server components)
```

**Rules:**
- All event tracking imports must come from `lib/tracking.ts`
- Never add event helper functions to `Analytics.tsx`
- Never call `gtag()` or `fbq()` directly in components — use centralized helpers
- Exception: `special-offer/layout.tsx` has an inline `fbq('track', 'ViewContent')` for page-load tracking

---

## Tracking Events

| Event                  | Trigger                          | GA4 | Google Ads Conversion | Meta Pixel Event | Value |
|------------------------|----------------------------------|-----|-----------------------|------------------|-------|
| `quote_request`        | Quote form — after API success   | ✅  | ✅                    | `Lead`           | £50   |
| `contact_form_submit`  | Contact form — after API success | ✅  | ✅                    | `Lead`           | £25   |
| `phone_click`          | Any `tel:` link click            | ✅  | ✅                    | `PhoneClick`     | £5    |
| `whatsapp_click`       | Any WhatsApp link/button click   | ✅  | ✅                    | `WhatsAppClick`  | £5    |

### Where Events Fire

**Form submissions (fire only after confirmed API success):**
- `components/QuoteForm.tsx` → `trackQuoteRequest({ service_type, postcode })`
- `components/ContactForm.tsx` → `trackContactForm({ subject })`
- `components/EnhancedContactSection.tsx` → `trackContactForm({ subject })`
- `app/special-offer/page.tsx` → `trackQuoteRequest({ service_type, postcode })`
- `app/offer-sandbach/page.tsx` → `trackQuoteRequest({ service_type, postcode })`

**Phone click placements (39 links across 18 files):**

| Component / Page                | Placement string(s)                                                        |
|---------------------------------|----------------------------------------------------------------------------|
| `FloatingCallButton`            | `floating_call_button`                                                     |
| `MobileContactBar`              | `mobile_contact_bar`                                                       |
| `EnhancedContactSection`        | `contact_form_success`, `contact_sidebar`                                  |
| `CTABanner`                     | `cta_banner_book`, `cta_banner_emergency`, `cta_banner_landline`, `cta_banner_mobile` |
| `Footer`                        | `footer_landline`, `footer_mobile`                                         |
| `FAQ`                           | `faq_section`                                                              |
| `AreaPageTemplate`              | `area_page_hero`, `area_page_cta`                                          |
| `emergency-roofing/page`        | `emergency_hero_mobile`, `emergency_hero_office`, `emergency_callout_mobile`, `emergency_callout_office`, `emergency_bottom_cta` |
| `contact/page`                  | `contact_info_landline`, `contact_info_mobile`, `contact_emergency_cta`    |
| `new-roofs/page`                | `new_roofs_hero`, `new_roofs_bottom_cta`                                   |
| `roof-repairs/page`             | `roof_repairs_hero`, `roof_repairs_bottom_cta`                             |
| `roofers-sandbach/page`         | `roofers_sandbach_hero`, `roofers_sandbach_bottom_cta`                     |
| `service-areas/page`            | `service_areas_hero`, `service_areas_bottom_cta`                           |
| `special-offer/page`            | `special_offer` (via `handlePhoneClick`)                                   |
| `offer-sandbach/page`           | `offer_sandbach_hero`, `offer_sandbach_bottom_cta`, `offer_sandbach_mobile_sticky` |
| `thank-you/page`                | `thank_you_page`                                                           |
| `sitemap-page/page`             | `sitemap_page`                                                             |
| `blog/emergency-roof-repairs`   | `blog_emergency_hero`, `blog_emergency_cta`                                |

**WhatsApp click placements (8 links across 6 files):**

| Component / Page                | Placement string                                     |
|---------------------------------|------------------------------------------------------|
| `WhatsAppButton`                | `floating_button`                                    |
| `MobileContactBar`              | `mobile_contact_bar`                                 |
| `EnhancedContactSection`        | `contact_sidebar`                                    |
| `special-offer/page`            | `special_offer` (via `handleWhatsAppClick`) ×2       |
| `offer-sandbach/page`           | `offer_sandbach_hero`, `offer_sandbach_mobile_sticky`|
| `thank-you/page`                | `thank_you_page`                                     |

---

## Required Environment Variables

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXX                          # Google Tag Manager container ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX                           # GA4 measurement ID
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX                  # Google Ads account ID
NEXT_PUBLIC_GA_CONVERSION_SEND_TO=AW-XXXXXXXXXX/YYYYY    # Google Ads conversion label (send_to)
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXX                  # Meta (Facebook) Pixel ID
```

All variables are optional — tracking degrades gracefully if any are missing.

**Note:** `components/Analytics.tsx` has hardcoded production ID fallbacks for GTM, GA4, and Google Ads to ensure tags load even without env vars configured. Once env vars are set in Vercel, the fallbacks are ignored.

---

## How to Test

### 1. Dev-Mode Console Logging
Run `npm run dev`. Every tracking call logs to the browser console with a `[tracking]` prefix showing event name and parameters. These logs only appear in development — no production console noise.

### 2. Google Tag Assistant
1. Install [Tag Assistant Companion](https://tagassistant.google.com/) Chrome extension
2. Connect to your site at https://tagassistant.google.com/
3. Perform actions (submit forms, click phone links, click WhatsApp)
4. Verify events appear in the Tag Assistant debug panel with correct parameters

### 3. GA4 DebugView
1. Go to GA4 → Admin → DebugView
2. Enable debug mode by adding `?debug_mode=true` to the URL, or use Tag Assistant
3. Submit a quote form → look for `quote_request`
4. Submit a contact form → look for `contact_form_submit`
5. Click a phone link → look for `phone_click` with `placement` parameter
6. Click WhatsApp → look for `whatsapp_click` with `placement` parameter

### 4. Google Ads Conversion Verification
1. Go to Google Ads → Tools → Conversions
2. Check that conversion actions are receiving data
3. Use Google Ads Tag Diagnostics to verify the conversion tag fires
4. Ensure `NEXT_PUBLIC_GA_CONVERSION_SEND_TO` matches your conversion action's label

### 5. Meta Pixel Helper
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
2. Browse the site and perform actions
3. Verify `Lead` events fire on form submissions
4. Verify `PhoneClick` and `WhatsAppClick` custom events fire on clicks

---

## Detecting Duplicate Event Firing

1. Open DevTools → Network tab → filter by `collect` or `google-analytics`
2. Perform an action (e.g. click a phone number)
3. You should see exactly **one** GA4 event request per action
4. If you see two identical events, check for:
   - Duplicate `onClick` handlers on the same element
   - Double-mounted React components
   - Both app code AND GTM triggers firing the same event
5. In dev mode, each `[tracking]` console log should appear exactly once per action

---

## Quick Smoke Test Checklist

- [ ] Submit quote form → `quote_request` fires once
- [ ] Submit contact form → `contact_form_submit` fires once
- [ ] Click any phone number → `phone_click` fires with correct `placement`
- [ ] Click any WhatsApp link → `whatsapp_click` fires with correct `placement`
- [ ] Check Network tab — no duplicate event requests
- [ ] Check dev console — `[tracking]` logs appear once per action
