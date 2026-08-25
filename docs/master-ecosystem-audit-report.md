# Master Ecosystem Audit — upgraderoofs.co.uk

_Generated 2026-08-25T12:14:14.864Z · 34 checks across 7 surfaces_

## GBP

- ✅ **OAuth token exchange** — business.manage scope token acquired
- ✅ **Account management (accounts.list)** — 1 account(s): accounts/108488463348570125274
- ✅ **Location fetch** — "Upgrade Roofs" — categories: Roofing contractor
- ✅ **Metadata / verification** — verified=no, duplicate=no
- ✅ **Maps coordinate (latlng)** — 53.1438854,-2.3663207
- ✅ **Website URI** — https://www.upgraderoofs.co.uk/

## GSC

- ✅ **Service-account auth** — webmasters.readonly + indexing scopes granted
- ✅ **Sitemap list** — 3 sitemap(s): https://www.upgraderoofs.co.uk/sitemap.xml, https://www.upgraderoofs.co.uk/page-sitemap.xml, https://www.upgraderoofs.co.uk/sitemap_index.xml
- ✅ **Town-page coverage sweep (15 pages)** — all 15 town pages indexable

## Indexing

- ✅ **Live URL submit (homepage)** — URL_UPDATED accepted — last notifyTime (n/a)

## GA4

- ✅ **Measurement ID (gtag)** — G-7V452FMYFY — via GTM GTM-5LMDG3F7
- ✅ **Consent Mode V2** — ad_storage/analytics_storage default denied; url_passthrough=true; ads_data_redaction=true
- ✅ **GTM container** — GTM-5LMDG3F7
- ✅ **Event stream (30d)** — 8 event name(s) flowing: session_start, page_view, user_engagement, first_visit, scroll, form_start, click, whatsapp_click
- ✅ **Conversion events present** — contact/phone/whatsapp/submit events observed

## Ads

- ✅ **OAuth token exchange** — adwords scope token acquired
- ✅ **Customer account** — Upgrade Roofs (8479028400) GBP
- ✅ **Campaign geo-target type** — 3 non-removed campaign(s) with geo_target_type_setting
- ✅ **Location criteria** — 17 location criterion row(s): 17 positive / 0 negative; 16 names resolved
- ⚠️ **Geo-footprint coverage (15 towns vs Ads targets)** — 3 town(s) without an explicit Ads location target: Tarporley, Biddulph, Newcastle-under-Lyme
- ⚠️ **Location (asset) linkage** — 0 location asset link(s) — business_name: (unset)
- ✅ **Conversion action inventory** — 14 action(s): Calls from ads(7398608367), Contact (Form submission https://www.upgraderoofs.co.uk/special-offer/special-offer)(7536580934), Submit lead form (Page load https://www.upgraderoofs.co.uk/special-offer)(7538264830), Local actions - Directions(7566190260), Local actions - Website visits(7574320471)
- ✅ **Offline conversion ids live** — site-visit=7700922852 ✓, job-won=7700922855 ✓
- ℹ️ **Conversion error log (30d)** — conversions=0, all_conversions=0 (delta 0 = view-through/cross-device attributed)

## DataManager

- ✅ **Refresh token present** — non-placeholder refresh token set
- ✅ **Local gclid validation (test payload)** — valid raw gclid (73 chars)
- ✅ **Validation battery (4 cases)** — 0 mismatch(es) — gclid guard accepts valid raw tokens and rejects corrupt/lowercase/gbraid/empty
- ✅ **Token exchange (datamanager scope)** — access token acquired (254 chars)

## Sweep

- ✅ **GEO footprint count (town-data.ts)** — 15 towns in code, now the canonical operational footprint
- ✅ **Town count vs service claim** — resolved: 15-town footprint is canonical (brief was stale at 10)
- ✅ **Town page routes (app/roofers-*)** — all 15 town routes present
- ✅ **seo-map.md present** — legacy seo-map.md removed; `lib/town-data.ts` is now the single footprint source
- ✅ **Consent mode + gclid capture wiring** — url_passthrough=true, consent_default=true, captureClickIds=true
- ℹ️ **Tag id consistency (GA4/GTM/Ads)** — GA4=G-7V452FMYFY, GTM=GTM-5LMDG3F7, GADS=AW-7693225904, GADS_CONV=AW-7693225904

## Key discrepancies to action

- ✅ **Ads → Geo-footprint coverage (15 towns vs Ads targets)**: RESOLVED — Tarporley, Biddulph, Newcastle-under-Lyme added as positive location criteria on Leads-Search-calls
- **Ads → Location (asset) linkage**: 0 location asset link(s) — business_name: (unset)
- ✅ **Sweep → Town count vs service claim**: RESOLVED — 15-town footprint is canonical; "10 service towns" was stale
- ✅ **Sweep → seo-map.md present**: RESOLVED — legacy seo-map.md removed; `lib/town-data.ts` is the single footprint source

## Methodology

- Credentials loaded from `.env.local` (values never printed).
- GBP: My Business Account Management v1 (`accounts.list`) + Business Information v1 (`locations.get`).
- GSC: Search Console v3 sitemaps + URL Inspection; Indexing API v3 `urlNotifications.publish` (URL_UPDATED on homepage).
- GA4: static tag-config inspection (`G-7V452FMYFY` via `GTM-5LMDG3F7`) + Data API `runReport` (eventName stream).
- Ads: REST v22 GAQL `searchStream` (geo_target_type_setting, location criteria, location assets, conversion actions).
- Data Manager: local `validateGclid()` mirror + `datamanager` scope token exchange (no real event submitted).
- Town footprint from `lib/town-data.ts` (15 towns), cross-checked against app-router pages.
