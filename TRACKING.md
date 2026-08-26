# Event Tracking Reference

> Single source of truth: `lib/tracking.ts`
> Tag initialization: `components/Analytics.tsx`

## Events

| Event               | Trigger                        | GA4 | Google Ads | Meta Pixel       | Value |
|---------------------|--------------------------------|-----|------------|------------------|-------|
| `quote_request`     | Quote form success             | ✅  | ✅ conversion | ✅ `Lead`        | £50   |
| `contact_form_submit` | Contact form success         | ✅  | ✅ conversion | ✅ `Lead`        | £25   |
| `phone_click`       | Any `tel:` link click          | ✅  | ✅ conversion | ✅ `PhoneClick`  | £5    |
| `whatsapp_click`    | Any WhatsApp link/button click | ✅  | ✅ conversion | ✅ `WhatsAppClick`| £5   |

## Tracked Components

### Forms (fire only on confirmed API success)
- `QuoteForm.tsx` → `trackQuoteRequest({ service_type, postcode })`
- `ContactForm.tsx` → `trackContactForm({ subject })`
- `EnhancedContactSection.tsx` → `trackContactForm({ subject })`
- `special-offer/page.tsx` → `trackQuoteRequest({ service_type, postcode })`
- `offer-sandbach/page.tsx` → `trackQuoteRequest({ service_type, postcode })`

### Phone Click Placements
| Component / Page               | Placement string(s)                                    |
|---------------------------------|--------------------------------------------------------|
| `FloatingCallButton`            | `floating_call_button`                                 |
| `MobileContactBar`              | `mobile_contact_bar`                                   |
| `EnhancedContactSection`        | `contact_sidebar`                                      |
| `CTABanner`                     | `cta_banner_book`, `cta_banner_call`, `cta_banner_mobile`, `cta_banner_landline` |
| `Footer`                        | `footer_mobile`, `footer_landline`                     |
| `FAQ`                           | `faq_cta`                                              |
| `AreaPageTemplate`              | `area_page_hero`, `area_page_cta`                      |
| `emergency-roofing/page`        | `emergency_hero_mobile`, `emergency_hero_office`, `emergency_callout_mobile`, `emergency_callout_office`, `emergency_bottom_cta` |
| `contact/page`                  | `contact_info_landline`, `contact_info_mobile`, `contact_emergency_cta` |
| `new-roofs/page`                | `new_roofs_hero`, `new_roofs_bottom_cta`               |
| `roof-repairs/page`             | `roof_repairs_hero`, `roof_repairs_bottom_cta`         |
| `roofers-sandbach/page`         | `roofers_sandbach_hero`, `roofers_sandbach_bottom_cta` |
| `service-areas/page`            | `service_areas_hero`, `service_areas_bottom_cta`       |
| `special-offer/page`            | `special_offer` (via handlePhoneClick)                 |
| `offer-sandbach/page`           | `offer_sandbach_hero`, `offer_sandbach_bottom_cta`, `offer_sandbach_mobile_sticky` |
| `thank-you/page`                | `thank_you_page`                                       |
| `sitemap-page/page`             | `sitemap_page`                                         |
| `blog/emergency-roof-repairs`   | `blog_emergency_hero`, `blog_emergency_cta`            |

### WhatsApp Click Placements
| Component / Page               | Placement string                   |
|---------------------------------|------------------------------------|
| `WhatsAppButton`                | `floating_whatsapp`                |
| `MobileContactBar`              | `mobile_contact_bar`               |
| `EnhancedContactSection`        | `contact_sidebar`                  |
| `special-offer/page`            | `special_offer`                    |
| `offer-sandbach/page`           | `offer_sandbach_hero`, `offer_sandbach_mobile_sticky` |
| `thank-you/page`                | `thank_you_page`                   |

## Required Environment Variables

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXX           # Google Tag Manager container ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX            # GA4 measurement ID
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX   # Google Ads account ID
NEXT_PUBLIC_GA_CONVERSION_SEND_TO=AW-XXXXXXXXXX/YYYYYYYYY  # Google Ads conversion label
NEXT_PUBLIC_GADS_CLICK_CONV_ID=AW-XXX/YYY # Dedicated phone/WhatsApp-tap conversion action (NOT the lead-form ID)
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXX   # Meta Pixel ID
```

All are optional — tracking degrades gracefully if any are missing.
In development, missing vars produce a single console warning on page load.

**Note:** `components/Analytics.tsx` has hardcoded production ID fallbacks for GTM, GA4, and Google Ads. These ensure tags load even if env vars are not yet configured. Once env vars are set in Vercel, the fallbacks are ignored.

## Architecture

```
components/Analytics.tsx    → Tag initialization ONLY (GTM, GA4, Google Ads, Meta Pixel, Consent Mode)
lib/tracking.ts             → ALL event helper functions (single source of truth)
components/TrackedPhoneLink → Reusable wrapper for tel: links in server components
components/TrackedWhatsAppLink → Reusable wrapper for wa.me links in server components
```

**Rules:**
- Never add event helpers to `Analytics.tsx` — use `lib/tracking.ts`
- Never call `gtag()` or `fbq()` directly in components — use the centralized helpers
- Exception: `special-offer/layout.tsx` has an inline `fbq('track', 'ViewContent')` for page-load tracking (not a user action)

## Detecting Duplicate Firing

1. Open browser DevTools → Network tab → filter by `collect` or `google-analytics`
2. Perform an action (e.g. submit a form)
3. You should see exactly **one** GA4 event request per action
4. If you see two identical events, check for duplicate `onClick` handlers or double-mounted components
5. In dev mode, check the console — each `[tracking]` log should appear once per action

## Testing Instructions

### 1. Local Dev-Mode Debug Logging
Run `npm run dev`. Every tracking call logs to the browser console with an orange `[tracking]` prefix showing event name and all parameters. No production console noise.

### 2. Google Tag Assistant
1. Install [Tag Assistant Companion](https://tagassistant.google.com/) Chrome extension
2. Navigate to https://tagassistant.google.com/ and connect to your site
3. Perform actions (submit forms, click phone links, click WhatsApp)
4. Verify events appear in the Tag Assistant debug panel with correct parameters

### 3. GA4 DebugView
1. Go to GA4 Admin → DebugView
2. Enable debug mode: add `?debug_mode=true` to the URL or use Tag Assistant
3. Submit a quote form → look for `quote_request` event
4. Submit a contact form → look for `contact_form_submit` event
5. Click a phone link → look for `phone_click` event with `placement` parameter
6. Click WhatsApp → look for `whatsapp_click` event with `placement` parameter

### 4. Google Ads Conversion Verification
1. Go to Google Ads → Tools → Conversions
2. Check that conversion actions are receiving data
3. Use the Google Ads Tag Diagnostics to verify the conversion tag fires
4. Ensure `NEXT_PUBLIC_GA_CONVERSION_SEND_TO` matches your conversion action's label

### 5. Meta Pixel Helper
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
2. Browse the site and perform actions
3. Verify `Lead` events fire on form submissions
4. Verify `PhoneClick` and `WhatsAppClick` custom events fire on clicks

### 6. Quick Smoke Test Checklist
- [ ] Submit quote form → `quote_request` fires once
- [ ] Submit contact form → `contact_form_submit` fires once
- [ ] Click any phone number → `phone_click` fires with correct `placement`
- [ ] Click any WhatsApp link → `whatsapp_click` fires with correct `placement`
- [ ] Check Network tab — no duplicate event requests
- [ ] Check console in dev mode — `[tracking]` logs appear with orange prefix

---

## GoHighLevel (GHL) Client Notification Workflow (Account 8479028400)

### Purpose

Additive, **non-disruptive** instant email alert to `upgraderoofs@yahoo.com` whenever a new contact is created in the Upgrade Roofs GHL account. Complements (does not replace) the existing nodemailer email path in `lib/mail.ts`, which already delivers lead details to the same mailbox via `EMAIL_TO` (default `upgraderoofs@yahoo.com`).

### Workflow Configuration Steps

1. In GHL (account **8479028400**), navigate to **Automations → Workflows → Create Workflow**, and choose **"Start from Scratch"**.
2. Set the trigger to **"Contact Created"** (the built-in trigger that fires whenever a new contact is upserted — this catches all three website forms: quote, contact, and special offer).
3. Add an **"Email"** step (or "Internal Notification") with recipient `upgraderoofs@yahoo.com`.
4. Compose the body using GHL contact merge tags:
   - **Name:** `{{contact.name}}`
   - **Phone:** `{{contact.phone}}`
   - **Email:** `{{contact.email}}`
   - **Service Requested (per-form fallback):** `{{contact.service_type}}` → `{{contact.service_needed}}` → `{{contact.subject}}`
   - **Postcode:** `{{contact.postcode}}` (quote form only)
   - **Source:** `{{contact.source}}` or the `{{contact.tags}}` (reveals `website-lead`, `cheshire-roof-quote`, `contact-form`, `special-offer`)
5. **Service Requested fallback rationale:** each form writes a different service field into GHL, and the contact form's `subject` is delivered via notes only — so the notification should display the first non-empty of `service_type` (quote form) → `service_needed` (special offer form) → `subject` (contact form). Use GHL's conditional/custom-value merge or a small "If/Else" branch to render whichever field is populated.
6. The contact's **gclid** (first-party click id) is available as `{{contact.gclid}}` (written natively at upsert time by `lib/ghl.ts`) and as the readable custom-field copy — useful for a "Google Ads Lead" flag in the alert.
7. Publish and enable the workflow. No code changes are required.

### Non-Disruption Guarantee

- **Runs asynchronously on a parallel branch after contact creation** — it never runs inline with, or before, the website form API routes (`send-quote`, `send-contact`, `send-special-offer`), so it cannot block or delay the lead capture.
- **Preserves GCLIDs & Tracking** — the gclid is written to the contact *at upsert time* (in `lib/ghl.ts`) and read *at opportunity stage-shift time* (in `app/api/ghl-webhook/route.ts` via tolerant `pick()`). A "Contact Created" notification fires downstream of the upsert and before any stage shift, altering neither write nor read.
- **Preserves API data syncs** — GHL contact/opportunity sync, `triggerSpeedToLead`, and Voice AI workflow enrollment are all independent of the notification step.
- **Preserves offline conversions** — the Google Ads `UPLOAD_CLICKS` path in `app/api/ghl-webhook/route.ts` is keyed off opportunity stage changes, not contact creation; the notification does not touch it.
- **No delay** — the notification is a parallel GHL-side action; the existing nodemailer email and all conversion events continue to fire on their own paths.

> **Security note:** Keep `GHL_WEBHOOK_SECRET` set in **both** Vercel and the GHL workflow's "Send Webhook" step. If left empty, the webhook endpoint (`/api/ghl-webhook`) is an open auth/abuse hole.
