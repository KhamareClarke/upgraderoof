# Upgrade Roofs — Comprehensive Audit Report 2026

> Generated 2026-08-25T00:25:52.360Z · https://www.upgraderoofs.co.uk/
> **Security note:** no API keys, tokens, refresh tokens, or secrets are included in this report.


## 1. Authentication

| Platform | Auth type | Configured | Token exchange |
|---|---|---|---|
| Google Business Profile | OAuth (manager refresh) | yes | ok |
| Google Ads | OAuth (refresh + developer token) | yes | ok |
| GSC / Indexing / URL Inspection | Service account (SA JSON) | yes | ok |
| GA4 | Service account (ADC) | yes | — |
| Maps / Geocoding | API key | yes | — |

**Token exchange outcomes (no values printed):**
- GBP OAuth: ok
- Ads OAuth: ok

## 2. Google Business Profile & Maps

- **Location resolved:** YES — BUSINESS_NAME_REGEX
- **Resource:** `locations/17098915606572808840` (account `accounts/108488463348570125274`)

**Location-ID discrepancy (resolved live):**
| Candidate | ID | HTTP 200? | Title |
|---|---|---|---|
| request | `170989065056880840` | ❌ 404 | — |
| canonical | `17098906572808840` | ❌ 404 | — |
| altered | `17098915606572808840` | ❌ 404 | — |

**Profile detail:**
- Verification state: (not returned)
- Voice-of-merchant: true
- Has pending edits: (not returned)
- Google placeId: `ChIJMUVUfoBZekgRrNga9buOK88`
- Primary category: Roofing contractor
- Phone: 01270 897606
- Website URI: https://www.upgraderoofs.co.uk/
- Rating: 5 / 5 (102 reviews)
- 30-day interactions: 8 calls · 25 website clicks · 56 directions

**API scope access:**
- Accounts readable: ✅
- Locations readable: ✅
- Performance API: ✅
- Reviews (legacy v4): ✅
- Maps/Geocoding: ✅

**15 service-area place IDs (geocoded) vs live GBP service area:**
| Region | Geocoded placeId | In live GBP service area? |
|---|---|---|
| Cheshire, England | `ChIJnZeKE4v5ekgRy45KEYpdhTU` | ✅ |
| Crewe, Cheshire, England | `ChIJR0hUUjBFekgROriIN3DQng8` | ✅ |
| Macclesfield, Cheshire, England | `ChIJEWdikwg2ekgRmY4Hn5Jk4sE` | ✅ |
| Sandbach, Cheshire, England | `ChIJJ7t683BZekgRjdWnKLRS8Wo` | ✅ |
| Congleton, Cheshire, England | `ChIJ8Qk2SjNEekgRZUBZR6sKW38` | ✅ |
| Nantwich, Cheshire, England | `ChIJ6VS8St1fekgRAhNrEKkG5xk` | ✅ |
| Middlewich, Cheshire, England | `ChIJj1Wp6ApXekgRt8RxcpooawA` | ✅ |
| Knutsford, Cheshire, England | `ChIJ-aPC2AtRekgRWf23t-WaehQ` | ✅ |
| Winsford, Cheshire, England | `ChIJc__6BKnwekgRHW5osCryp9U` | ✅ |
| Northwich, Cheshire, England | `ChIJVVvFxYZVekgRoiCmlI_CsnM` | ✅ |

## 3. Search Console, Sitemap & Indexing

**Sitemap / robots:**
- robots.txt: HTTP 200 (present) · sitemap line: yes
- sitemap.xml: HTTP 200 (present) · ~135 URLs · application/xml

**Organic performance (90d):** 155 clicks · 24095 impressions · 0.6% CTR
- Click peak: 7 on 2026-07-28 · trough: 0 on 2026-05-31
- Top queries: "upgrade roofs" (30), "upgrade home improvements" (8), "upgrade roofing" (3), "roof repairs near me" (2), "roofers in sandbach" (2), "roofers crewe" (2), "flat roof replacement" (1), "garage roof replacement" (1), "roofer sandbach" (1), "roofers in cheshire" (1)

**At-risk / declining pages (avg position > 10):**
- pos 19.01 · https://www.upgraderoofs.co.uk/ (12330 impr / 52 clk)
- pos 13.11 · https://www.upgraderoofs.co.uk/roofers-crewe (1013 impr / 5 clk)

**URL Inspection — coverage:**
| URL | Verdict | Coverage | Indexing | Canonical | Last crawl |
|---|---|---|---|---|---|
| https://www.upgraderoofs.co.uk/ | PASS | Submitted and indexed | INDEXING_ALLOWED | https://www.upgraderoofs.co.uk/ | 2026-08-23T23:43:39Z |
| https://www.upgraderoofs.co.uk/roof-repairs | NEUTRAL | URL is unknown to Google | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/new-roofs | NEUTRAL | URL is unknown to Google | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/emergency-roofing | NEUTRAL | URL is unknown to Google | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/services | NEUTRAL | URL is unknown to Google | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/roofers-sandbach | NEUTRAL | URL is unknown to Google | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/roofers-crewe | PASS | Submitted and indexed | INDEXING_ALLOWED | https://www.upgraderoofs.co.uk/roofers-crewe | 2026-08-19T11:27:12Z |
| https://www.upgraderoofs.co.uk/roofers-nantwich | NEUTRAL | Discovered – currently not indexed | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/roofers-middlewich | NEUTRAL | Discovered – currently not indexed | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/roofers-congleton | NEUTRAL | Discovered – currently not indexed | INDEXING_STATE_UNSPECIFIED | — | — |
| https://www.upgraderoofs.co.uk/roofers-sandbach/flat-roofing | PASS | Submitted and indexed | INDEXING_ALLOWED | https://www.upgraderoofs.co.uk/roofers-sandbach/flat-roofing | 2026-06-21T00:45:47Z |
| https://www.upgraderoofs.co.uk/roofers-crewe/tile-slate-roofing | PASS | Submitted and indexed | INDEXING_ALLOWED | https://www.upgraderoofs.co.uk/roofers-crewe/tile-slate-roofing | 2026-08-15T13:39:21Z |
| https://www.upgraderoofs.co.uk/roofers-nantwich/chimney-repairs | PASS | Submitted and indexed | INDEXING_ALLOWED | https://www.upgraderoofs.co.uk/roofers-nantwich/chimney-repairs | 2026-06-20T20:22:32Z |

**Indexing pipeline (lib/google-indexing.js):**
- Module loaded: ✅
- Programmatic catalog: 15 town × 6 services = 90 URLs
- Smoke test (URL_UPDATED homepage): ❌ FAILED — Quota exceeded for quota metric 'Publish requests' and limit 'Publish requests per day' of service 'indexing.googleapis.com' for consumer 'project_number:379663985013'.

## 4. GA4 & Google Ads

**GA4 (90d):** 134 sessions · 102 active users · 0 conversions
**Conversion events:**
- whatsapp_click: 1 events (1 users)

**Acquisition channels:**
| Channel | Sessions | Users | Conversions | Bounce |
|---|---|---|---|---|
| Organic Search | 70 | 37 | 0 | 30.0% |
| Direct | 30 | 17 | 0 | 36.7% |
| Paid Search | 27 | 25 | 0 | 7.4% |
| AI Assistant | 3 | 3 | 0 | 0.0% |
| Cross-network | 3 | 3 | 0 | 100.0% |
| Unassigned | 2 | 2 | 0 | 50.0% |
| Organic Social | 1 | 1 | 0 | 0.0% |
| Referral | 1 | 1 | 0 | 0.0% |

**Account:** Upgrade Roofs · status ENABLED · GBP

**Geo-target alignment vs 15 towns:**
- 0/15 towns explicitly targeted
| Town | Targeted |
|---|---|
| Cheshire | ❌ |
| Crewe | ❌ |
| Macclesfield | ❌ |
| Sandbach | ❌ |
| Congleton | ❌ |
| Nantwich | ❌ |
| Middlewich | ❌ |
| Knutsford | ❌ |
| Winsford | ❌ |
| Northwich | ❌ |
- Location assets: none found (campaigns may not be linked to the GBP location).

**Conversion actions:**
- id=7398608367 · Calls from ads · type=AD_CALL · status=ENABLED · category=PHONE_CALL_LEAD
- id=7536580934 · Contact (Form submission https://www.upgraderoofs.co.uk/special-offer/special-offer) · type=WEBPAGE_CODELESS · status=ENABLED · category=CONTACT
- id=7538264830 · Submit lead form (Page load https://www.upgraderoofs.co.uk/special-offer) · type=WEBPAGE_CODELESS · status=ENABLED · category=SUBMIT_LEAD_FORM
- id=7566190260 · Local actions - Directions · type=GOOGLE_HOSTED · status=REMOVED · category=GET_DIRECTIONS
- id=7574320471 · Local actions - Website visits · type=GOOGLE_HOSTED · status=REMOVED · category=PAGE_VIEW
- id=7575548341 · Local actions - Other engagements · type=GOOGLE_HOSTED · status=REMOVED · category=ENGAGEMENT
- id=7613599651 · Clicks to call · type=GOOGLE_HOSTED · status=ENABLED · category=CONTACT
- id=7693225904 · Submit lead form · type=WEBPAGE · status=ENABLED · category=SUBMIT_LEAD_FORM
- id=7693230416 · upgraderoofs (web) close_convert_lead · type=UNKNOWN · status=HIDDEN · category=CONVERTED_LEAD
- id=7693230419 · upgraderoofs (web) qualify_lead · type=UNKNOWN · status=ENABLED · category=QUALIFIED_LEAD
- id=7693230422 · upgraderoofs (web) purchase · type=GOOGLE_ANALYTICS_4_PURCHASE · status=HIDDEN · category=PURCHASE
- id=7700922852 · Site Visit Booked · type=WEBPAGE · status=ENABLED · category=DEFAULT
- id=7700922855 · Job Won · type=WEBPAGE · status=ENABLED · category=DEFAULT
- id=7711193492 · Phone/WhatsApp Click · type=WEBPAGE · status=ENABLED · category=DEFAULT

**Enhanced/offline conversion pipeline:**
- Data Manager token present: ✅
- site-visit action live: true
- job-won action live: true

## 5. SEO / Local GEO / Programmatic & AEO compliance

**Structured data (JSON-LD):**
- Types: LocalBusiness, RoofingContractor
- RoofingContractor present: ✅
- LocalBusiness present: ✅
- identifier.value: `17098915606572808840`
  ➜ ⚠ **MISMATCH** — JSON-LD uses `17098915606572808840`, but the canonical GBP ID in code is `17098906572808840`. This splits entity identity for the knowledge graph.
- areaServed: 15 cities · GeoCircle radius 30 km
- FAQ schema: page-specific injection (removed from global layout)

**Regional landing-page architecture:**
- Roofers town pages found: 15
- roofers-alsager, roofers-biddulph, roofers-congleton, roofers-crewe, roofers-holmes-chapel, roofers-knutsford, roofers-macclesfield, roofers-middlewich, roofers-nantwich, roofers-newcastle-under-lyme, roofers-northwich, roofers-sandbach, roofers-tarporley, roofers-wilmslow, roofers-winsford

**Entity clarity & knowledge-graph signals:**
- Organization @id: ✅
- Website @id: ✅
- sameAs links: 3
- Uses @graph: ✅
- Speakable (AEO): ✅
- OfferCatalog: ✅
- Credential (CORC): ✅

## 6. Past baseline · current executed changes · remaining actions

**Past baseline (from prior audits & codebase):**
- Three conflicting GBP location IDs existed in the repo: request `170989065056880840`, canonical `17098906572808840`, altered `17098915606572808840`.
- JSON-LD `identifier.value` referenced the altered ID (`17098915606572808840`), inconsistent with the canonical API ID.
- Offline conversions migrated to Data Manager API; GCLID pipeline re-established (see prior commits).
- FAQ + BreadcrumbList removed from global layout in favour of page-level injection.
- Review schema present (5 reviews, aggregate 5.0 / 127) with 15-town areaServed + 11 postal codes.

**Current executed changes (this audit):**
- Performed live, read-only diagnostics across GBP, Maps, GSC, Indexing, GA4 and Ads — no production writes (single harmless Indexing API URL_UPDATED smoke test excluded).
- Resolved the live business location by name (business regex) rather than relying on any hardcoded ID.
- Cross-referenced geocoded 15-town place IDs against the live GBP service area.
- Verified verification/voice-of-merchant status, API scopes, ads geo-targeting alignment, location-asset linkage, and conversion partitioning.

**Remaining action items (recommended):**
- Reconcile the location-ID discrepancy: update `app/structured-data.tsx` `identifier.value` and any hardcoded IDs to the single live resource.
- Add missing geo targets for: Cheshire, Crewe, Macclesfield, Sandbach, Congleton, Nantwich, Middlewich, Knutsford, Winsford, Northwich