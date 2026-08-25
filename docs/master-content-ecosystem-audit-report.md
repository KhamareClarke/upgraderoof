# Master Content Ecosystem Audit Report

**Scope:** `app/layout.tsx`, `app/structured-data.tsx`, `app/sitemap.ts`, `app/robots.ts` (plus their transitive dependencies: `lib/routes.ts`, `lib/contact.ts`, and page-level schema components referenced by `structured-data.tsx`).

**Audited:** 2026-08-25

**Method:** Line-by-line code inspection. Findings are grouped by review area, then consolidated into a scored section out of 100.

---

## Executive Summary

This is a four-pillar audit of the `upgraderoofs.co.uk` content surface, spanning **technical SEO + structured data**, **AEO / answer readiness**, **GEO / entity alignment**, and **programmatic SEO (pSEO) regional uniqueness**. The findings below are the *current* state after every fix landed and `tsc --noEmit` was confirmed green.

The 13 sections are **not independent pillars** — several supersede earlier snapshots of the same pillar. The report re-audits the core crawl/schema files (§8 superseding §1–§5), the AEO readiness (§10 superseding §6), and the entity markup (§11 + §12 superseding §7). Treating all 13 as co-equal would double-count stale scores, so the consolidated score is built from the four **latest** live pillar scores:

| Pillar | Latest section(s) | Score | Status |
|---|---|---|---|
| Technical SEO & structured data (crawl/schema) | §8 (supersedes §1–§5) | **91 / 100** | Minor housekeeping only |
| AEO / answer-engine readiness | §10 (supersedes §6) | **100 / 100** | FAQ schema + visible accordions everywhere |
| GEO / entity alignment & attribution | §11 + §12 (supersedes §7) | **84.25 / 100** | GBP ID split fixed; visible citations still open |
| pSEO / regional uniqueness | §13 | **75.75 / 100** | Thin 90-page matrix is the main risk |
| **Overall ecosystem score** | — | **87.75 / 100** | Weighted mean of the four live pillars |

### Overall ecosystem score: **87.75 / 100**

The overall is the **equally-weighted mean of the four live pillar scores** — (91 + 100 + 84.25 + 75.75) ÷ 4 = **87.75 / 100**. Every pillar is now above 75; the residual risk is concentrated in a single lever (pSEO matrix-page thinness), not spread across the surface.

**Superseded historical scores (for traceability, not aggregated):** initial core audit §1–§5 = 92, early AEO §6 = 64.5, early entity §7 = 57.75. These were the "before" readings that motivated the fixes now reflected in §8, §10, and §11–§12.

**Highest-leverage remaining fixes (in order):**
1. **pSEO matrix pages (§13, −10.5)** — add one 40–60-word town-aware paragraph per service×town page; today they read as `service.description` + an interpolated scalar, close to doorway content.
2. **Cross-town theme differentiation (§13, −8.0)** — rewrite the 6 near-identical `subsidence` / `concrete-tiles` / `EPDM-20-year` solution strings in `lib/town-data.ts`.
3. **Visible attribution (§11.4, priority 4)** — surface human-readable citation/byline links (CORC, VELUX, MyApproved) to convert machine-only `sameAs`/`hasCredential` into a provenance trail.

---

## 1. Structured Data — LocalBusiness

**File:** `app/structured-data.tsx`

The site emits a single JSON-LD document using the `@graph` pattern, anchoring three entities to a stable `@id` (`#organization`, `#website`, `#webpage`). This is a strong architecture choice: a single `application/ld+json` blob parses more reliably for both search engines and HTML-only LLM scrapers, and cross-entity references (`publisher`, `isPartOf`) resolve deterministically via `@id` rather than by duplicated object literals.

### Correct

- **Multi-type declaration is valid** — `"@type": ["LocalBusiness", "RoofingContractor"]` is legal schema.org syntax. `RoofingContractor` is a sub-type of `HomeAndConstructionBusiness` → `LocalBusiness`, so Google treats this as a LocalBusiness entity with a more specific type. Recommended and correct.
- **Address + geo + openingHoursSpecification** are present and well-formed. Coordinates (`53.1461, -2.3679`) correspond to Sandbach, Cheshire. Opening hours use the correct `OpeningHoursSpecification` shape, split across a weekday block and Saturday (no Sunday — consistent with a trades business).
- **`areaServed` is well-structured** using `City`, `State`, and `PostalCode` typed entries; `serviceArea` uses a `GeoCircle` with `geoRadius: '30000'` (30 km).
- **`sameAs`** links to Facebook, Instagram, X, YouTube, Pinterest, a Google share link, and Companies House. The Companies House search URL and the Google share link are weaker citations than direct profile URLs, but functional.
- **`hasCredential`** correctly models the CORC certification as an `EducationalOccupationalCredential` with `recognizedBy`.
- **`hasOfferCatalog`** lists six services as `Offer` → `Service` entities — consistent with the `knowsAbout` array and the actual service subpages.
- **`potentialAction`** uses `RequestQuote` → `EntryPoint` with `DesktopWebPlatform` / `MobileWebPlatform`. Valid.
- **`identifier`** carries the Google Business Profile ID as a `PropertyValue`.

### Issues
1. ✅ **RESOLVED** — `aggregateRating` + `review` removed from the global LocalBusiness entity (`app/structured-data.tsx`). The hard-coded `reviewCount: 127` and five embedded reviews are gone. Real reviews surface via the homepage `<GhlReviewsWidget />` and the Google Business Profile, so rating/award markup is no longer self-serving.

2. ✅ **RESOLVED** — `aggregateRating.reviewCount: 127` removed along with the whole review block (#1), so there is no longer an indemonstrable count to reconcile.

3. ✅ **RESOLVED** — `speakable.cssSelector` now targets `['#entity-citation', '#hero', '#services', '#about']`, reconciled against `app/page.tsx`, so the selector set is verified.

4. **`email: 'upgraderoofs@yahoo.com'`** is a consumer Yahoo address. Not a schema validity problem, but a trust-signal / deliverability concern, and it appears in public JSON-LD which invites scraping.

5. **Footer/publisher cross-reference is one-directional.** `WebSite.publisher` points to `#organization` but the `LocalBusiness` does not declare `branchOf`/`parentOrganization` back. Minor — not required for validity.

---

## 2. Structured Data — FAQPage

**File:** `components/FAQPageSchema.tsx` (used by page-level schemas such as `app/roof-repairs/schema.tsx`, `app/roofers-sandbach/page.tsx`, `app/services/tile-slate-roofing/page.tsx`, `app/blog/choosing-roofing-contractor/page.tsx`, `app/page.tsx`).

### Correct

- **The reusable `FAQPageSchema` component is valid.** It emits `@type: FAQPage` with a `mainEntity` array of `Question` → `acceptedAnswer` → `Answer`. This matches Google's required shape exactly.
- **FAQ markup is page-scoped, not global.** The `structured-data.tsx` comment makes this explicit: Breadcrumb/FAQ are intentionally injected "page-specifically where the content actually exists." This is the correct architecture — FAQPage markup must correspond to visible, on-page FAQ content, otherwise Google treats it as a violation. The `RoofRepairsSchema` example confirms a page-level FAQPage tied to real FAQ content.

### Issues (policy/compliance, not syntax)

6. **Compliance depends on FAQ answers being visible on-page.** Google requires the full text of each FAQ answer to be present in visible HTML. Any page that injects `FAQPageSchema` or `faqData` without rendering the same Q/A visibly is at risk. This report verifies the component is syntactically valid; on-page parity should be confirmed page-by-page (out of scope for the four audited files, but flagged as the key runtime risk).

7. **No FAQPage on the global layout** — correct by design (FAQ belongs on service/local pages). No action needed, but score reflects that FAQ validity is delegated to ~15+ individual pages rather than guaranteed centrally.

---

## 3. Sitemap Depth & Coverage

**File:** `app/sitemap.ts` → sources `lib/routes.ts`.

### Correct

- **Single source of truth** — sitemap, keyword-map, and internal-link helpers all derive from `lib/routes.ts`. Adding/removing a page in one place propagates. Strong design.
- **Stable `lastModified` values** (hard-coded `YYYY-MM-DD` strings, not `new Date()`) — this is explicitly correct practice and keeps sitemap caching effective.
- **`metadataBase` / `BASE_URL` are canonical** — both resolve to `https://www.upgraderoofs.co.uk` (www, HTTPS). Sitemap URLs are absolute.
- **Homepage URL handling is clean** — `route.path === '/' ? '' : route.path` avoids a trailing-slash duplicate.
- **Depth is well-controlled.** All indexable URLs are ≤ 3 slash-segments:
  - `/` (depth 0)
  - `/roof-repairs`, `/roofers-sandbach`, `/services`, `/blog`, `/privacy` (depth 1)
  - `/services/flat-roofing`, `/blog/emergency-roof-repairs` (depth 2)
  - `/roofers-sandbach/flat-roofing` (depth 3) — the service×location matrix generates 15 towns × 6 services = **90 pages**, all at depth 3.
- **No orphaned or intentionally-excluded pages leak into the sitemap.** Conversion/ads pages (`/offer-*`, `/special-offer`), `/thank-you`, `/sitemap-page`, and `/all-services` are excluded by design and documented in the header comment.

### Issues

8. **URL count requires verification against expected.** Total indexable routes: homepage (1) + core commercial (3) + service subpages (6, since `/flat-roofing` redirects and isn't listed; wait — `/services` + 6 service subpages = 7 total in `serviceSubpages`) + local commercial (16) + service×location (90) + trust (5) + blog index (1) + blog posts (10) + utility (2). Let me enumerate from the file precisely:
   - `homepage`: 1
   - `coreCommercial`: 3 (`/roof-repairs`, `/new-roofs`, `/emergency-roofing`)
   - `serviceSubpages`: 7 (`/services` + 6 service pages)
   - `localCommercial`: 16 (`/roofers-*` 15 + `/service-areas`)
   - `serviceLocationPages`: 15 × 6 = **90**
   - `trustPages`: 5
   - `blogIndex`: 1
   - `blogPosts`: 10
   - `utilityPages`: 2

   **Total = 135 URLs.** This is a healthy, crawlable depth profile with a clean programmatic-seo matrix. No corrections needed — but note the count is high enough that sitemap chunking would become relevant if the matrix grows (Google's limit is 50,000 URLs / 50 MB per sitemap, far from reached). Not an issue today.

9. **`changeFreq` on service×location matrix is `monthly`** while the `lastModified` is a single bulk date (`2026-06-11`). That's coherent (all matrix pages updated together), but means a "monthly" is a declared intent rather than observed crawl behavior — Google largely ignores `changeFreq`, so this is cosmetic only.

10. **Priority sanity is good** — homepage 1.0, local pages 0.75–0.95, service pages 0.8, blog 0.5, utility 0.3. No inflated priorities. No issue.

---

## 4. Canonical Metadata

**File:** `app/layout.tsx` (plus `metadataBase`).

### Correct

- **`metadataBase: new URL('https://www.upgraderoofs.co.uk')`** is set, which normalizes all `og:image`, canonical, and alternate resolution to the canonical www HTTPS host. This is the single most important canonicalization primitive and it is present.
- **No `alternates`/`canonical` override exists at layout level**, which is correct — Next.js emits per-page canonicals from `metadataBase`, and pages can override `alternates.canonical` locally when needed.
- **`title` uses `default` + `template`** (`'%s | Upgrade Roofs'`), so every page gets a sensible branded title with a canonical-style suffix. Good.
- **`robots` metadata in layout** sets `index: true, follow: true` and a `googleBot` block enabling max snippet length, large image preview, and `max-video-preview: -1`. Correct and permissive.

### Issues

11. **`locale: en_GB` in OpenGraph but `<html lang="en-GB">`** — consistent (both en-GB). No mismatch. (Note: `twitter` uses a `@upgraderoofing` handle that should be verified to exist; a dead/foreign handle breaks the Twitter card attribution silently.)

12. **No explicit `alternates.canonical` on the homepage** — relies on `metadataBase` + route resolution. Acceptable, but if any page historically omits or mishandles its own canonical, there's no central enforcement. Low severity.

---

## 5. Crawler Accessibility (`robots.ts`)

**File:** `app/robots.ts`.

### Correct

- **`sitemap` and `host` are declared** — crawlers are pointed at `https://www.upgraderoofs.co.uk/sitemap.xml`. Good.
- **`disallow` protects the right paths**: `/api/`, `/admin/`, `/thank-you`. The generic `userAgent: '*'` block also disallows `/_next/` (protecting build artifacts), which is correct and standard.
- **AI crawler opt-in/opt-out is deliberate.** The file explicitly lists `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, `OAI-SearchBot-Extended`, `Google-Extended`, `CCBot` — all with `allow: '/'`, and (for the search-targeting ones) the same protected-path exclusions. This is a considered decision: the site allows LLM/AI-crawler indexing of content while still hiding `/api/`, `/admin/`, `/thank-you`.

### Issues
13. ✅ **RESOLVED** — the non-standard `anthropic-ai` block is removed from `app/robots.ts`; only the documented `ClaudeBot` token remains for Anthropic's crawler.

14. **`Google-Extended` is set to `allow: '/'` with disallow of protected paths.** `Google-Extended` is the opt-out token for Gemini/Veo training; by allowing `/` the site is consenting to Google's extended (training) indexing. This is a business decision, not an error — but it is worth confirming it's intentional (it differs from many sites that block `Google-Extended` while allowing `Googlebot`).

15. **No `crawlDelay` / rate-limiting directives.** Not required (Google ignores `crawlDelay` anyway), but Bing/Yandex honor it. Cosmetic.

---

## Scored Section

Scoring rubric: each area weighted by SEO/visibility impact. 100 = flawless production-grade crawler/schema state.

| # | Area | Weight | Score (0–1) | Weighted |
|---|------|--------|-------------|----------|
| 1 | LocalBusiness schema validity & structure | 25% | 0.90 | 22.5 |
| 2 | FAQPage schema & placement policy | 15% | 0.85 | 12.75 |
| 3 | Sitemap depth & coverage | 20% | 0.98 | 19.6 |
| 4 | Canonical metadata & host normalization | 20% | 0.95 | 19.0 |
| 5 | Crawler accessibility (robots.txt) | 20% | 0.90 | 18.0 |
| | | **TOTAL** | 100% | | **91.85** |

### Score: **92 / 100**

### Deduction rationale

- **−2.25** (FAQPage): syntactically valid and correctly page-scoped, but parity is delegated to ~15 individual pages with no central guarantee of Q/A on-page parity.
- **−2.0** (robots): `Google-Extended` training-consent posture should be explicitly confirmed as intentional (the `anthropic-ai` token is now resolved, but this half remains).
- **−1.0** (sitemap): `changeFreq` is declared but crawler-ignored (cosmetic); no functional defect.
- **−1.0** (canonical): no central canonical enforcement beyond `metadataBase`; unverified Twitter handle.

> ⚠️ **Residual P1 risk not yet retired:** `components/TownLocalBusinessSchema.tsx` (lines 59–65) still emits a hard-coded `aggregateRating` (`ratingValue: 5`, `reviewCount: 127`) across the ~90-page service×location matrix — see section 7 finding 22. Retiring the global entity is not enough; this town-level entity carries the same self-generated-review manual-action risk and should be the next fix.

### Priority fixes (highest → lowest impact)

1. **P1 — Reconcile `aggregateRating`/`review` in `structured-data.tsx`.** Either (a) render the 127 reviews visibly on the homepage and link them to the GBP, or (b) remove `aggregateRating`/`review` from the layout-level graph until on-page visibility exists. This is the only item with genuine manual-action risk.
2. **P1 — Verify FAQ on-page parity** across all pages importing `FAQPageSchema` / a `faqData` block, since a visible-Q/A mismatch voids the FAQ rich result (and Google deprecated FAQ rich results for most sites — confirm the markup is still delivering value vs. effort).
3. **P2 — Verify `speakable` selectors** `#hero`, `#services`, `#about` exist on `app/page.tsx`, or remove `speakableData`.
4. **P2 — Confirm `Google-Extended` allow** is a deliberate training-consent decision; remove the non-standard `anthropic-ai` token (keep `ClaudeBot`).
5. **P3 — Replace the Yahoo email** in the public JSON-LD with a domain-aligned address to reduce scraping and improve trust signals.

---

*Generated by code-level inspection. On-page FAQ parity, live `speakable` selector resolution, and Twitter-handle verification require runtime/page-content validation outside the four audited files.*

---

## 6. AEO Readiness (Answer Engine Optimization)

**Scope (this section):** `components/ServiceLocationTemplate.tsx`, `components/AreaPageTemplate.tsx`, `components/SEOAccordion.tsx`, `components/FAQ.tsx`, `app/roof-repairs/page.tsx` + `app/roof-repairs/schema.tsx`, `app/new-roofs/page.tsx`, `app/emergency-roofing/page.tsx`, plus `lib/routes.ts` and `lib/service-location-helpers.ts`.

**What AEO means here:** readiness to be surfaced as the single best answer by LLM answer engines, Google AI Overviews, and voice assistants. Three properties dominate that outcome: (a) an explicit, entity-first answer within the first 40–60 words of the page body (front-loading), (b) a clean, non-skipping H2/H3 heading hierarchy that a parser can walk deterministically, and (c) FAQ structured data whose answers are rendered in visible HTML (parity), so the markup is both machine-readable and verifiable.

### 6.1 Front-loaded answers (40–60 words)

| Page / template | Front-load mechanism | Word count | Verdict |
|---|---|---|---|
| `ServiceLocationTemplate.tsx` | `<section id="answer">` (lines 133–143), `<strong>` entity-first lead → `service.description.split('.')[0]` → trust signals | ~35–45 | ✅ Strong |
| `AreaPageTemplate.tsx` | `<section id="answer">` entity-first `<strong>` lead + distance + guarantee, plus a separate `<dl id="quick-answers">` block (3 concrete-price Q&As) | ~35–45 | ✅ Strongest |
| `app/roof-repairs/page.tsx` | `<section id="answer">` ("AEO: Answer-First Content Block", lines 88–106), `<strong>` lead + 4-item `<ul>` | ~40 | ✅ Present |
| `app/new-roofs/page.tsx` | *none* | — | ❌ Missing |
| `app/emergency-roofing/page.tsx` | *none* | — | ❌ Missing |

**Finding (16):** The two programmatic templates and `roof-repairs` front-load a direct answer as the first substantive body content — the correct AEO pattern. But **`/new-roofs` and `/emergency-roofing` — both priority-0.9 money pages — have no answer-first block at all.** Their body opens with a hero then jumps straight into longer-form sections, so an LLM scraper looking for a concise "what/who/where" answer within the first ~50 words finds nothing. These are the highest-traffic service pages on the site and are currently effectively AEO-invisible for direct-answer extraction.

### 6.2 H2/H3 heading hierarchy

**Findings (17–18):**

17. **Clean hierarchy in the templates and the three core commercial pages.** `ServiceLocationTemplate` and `AreaPageTemplate` run `h1` → `h2` → `h3` with no skips; `new-roofs`, `emergency-roofing`, and `roof-repairs` all maintain consistent `h2` section heads with `h3` sub-items. Sweeping, deterministic heading walks are possible — good.

18. **`SEOAccordion.tsx` skips heading levels and buries content behind a client toggle.** The component wraps a large "About Upgrade Roofs" block in a `useState` accordion (`max-h-[5000px]` open / `max-h-0` closed). Inside, the heading chain descends `h2` (in the button) → `h3` → `h4` (two card titles) → `h5` (six service cards). Two problems for AEO: (a) the `h4`/`h5` skips break the semantic outline (an `h3` under an `h2` should not be followed by an `h4` that introduces sibling content), and (b) the default-closed state means the richest "who we are / what we do" copy on affected pages is not present in the first render for a JS-minimal scraper. Note `components/FAQ.tsx` has the same client-toggle pattern (6 hard-coded Q&As in a `useState` accordion), but unlike `SEOAccordion` its content survives in static markup when the component itself is server-rendered.

### 6.3 FAQ schema robustness & parity

| Source | FAQPage schema? | Visible FAQ on page? | Parity |
|---|---|---|---|
| `ServiceLocationTemplate.tsx` | ✅ `faqSchema` from `generateServiceLocationFaqs()` (4 FAQs) | ✅ `<details>/<summary>` renders every Q/A | ✅ Full |
| `AreaPageTemplate.tsx` | ✅ merged `FAQPage` (3 `#quick-answers` + town FAQs) + `Speakable` | ✅ `<details>` content in DOM | ✅ Full |
| `app/roof-repairs/schema.tsx` | ✅ `faqData` (3 questions) | ✅ `<details>/<summary>` Renders all three Q/A | ✅ Full |
| `app/new-roofs/page.tsx` | ❌ none | ❌ none | — |
| `app/emergency-roofing/page.tsx` | ❌ none | ❌ none | — |
| `components/FAQ.tsx` | ❌ none emitted | ✅ 6 visible Q&As | inverted (visible, no schema) |

**Findings (19–21):**

19. **Templates are exemplary.** Both `ServiceLocationTemplate` and `AreaPageTemplate` emit `FAQPage` schema *and* render the answers via native `<details>/<summary>` elements, so the answers live in the DOM (crawlable by HTML-only scrapers, and verifiable by Google). This full parity is the model the rest of the site should follow. `AreaPageTemplate` additionally wires `SpeakableSpecification` (`cssSelector: ['#entity-citation', '#answer', '#quick-answers', 'h1']`) — the single most AEO-forward construct in the codebase.
20. ✅ **RESOLVED** — `app/roof-repairs/page.tsx` now renders all three FAQ Q&As visibly (a native `<details>/<summary>` section) matching `schema.tsx`'s `faqData` verbatim, and the three reviews were already rendered in the "What Customers Say" section. Full on-page parity.

21. **`/new-roofs` and `/emergency-roofing` have no FAQ layer at all.** No `FAQPage` schema, no visible FAQ — the second AEO dimension is flatly absent on two of the three core commercial money pages. `components/FAQ.tsx` (visible Q&As but no schema) exists as a ready-made block that could be reused to close this gap, but is currently not wired into either page, and its answers are not mirrored by any schema.

### AEO Scored Section (subset of total)

Scoring this AEO area independently (not re-weighted against sections 1–5) to quantify readiness across the three criteria:

| # | Criterion | Weight | Score (0–1) | Weighted |
|---|-----------|--------|-------------|----------|
| 6a | Answer front-loading (40–60 words entity-first) | 40% | 0.60 | 24.0 |
| 6b | H2/H3 hierarchy cleanliness | 25% | 0.85 | 21.25 |
| 6c | FAQ schema robustness & on-page parity | 35% | 0.55 | 19.25 |
| | **AEO TOTAL** | 100% | | **64.5** |

### AEO sub-score: **64.5 / 100**

The AEO *infrastructure* is strong (the two templates are genuinely excellent), but the hand-written core commercial pages pull the average down: two of three money pages miss front-loading and FAQ entirely, and `roof-repairs` has a schema-without-parity defect. The fix list is small and high-leverage.

### Deduc/priority rationale (AEO)

- **−16.0** on front-loading (weight 40%): `new-roofs` and `emergency-roofing` lack an answer-first block — the single highest-impact AEO gap given their traffic and priority.
- **−3.75** on heading hierarchy (weight 25%): `SEOAccordion.tsx` skips `h3`→`h4`→`h5` and hides content behind a client-only toggle.
- **−15.75** on FAQ robustness (weight 35%): `roof-repairs` declares FAQ schema it never renders (parity break), and `new-roofs`/`emergency-roofing` have no FAQ anywhere.

### Priority fixes (AEO)

1. **P1 — Add an `<section id="answer">` block to `/new-roofs` and `/emergency-roofing`.** Mirror `ServiceLocationTemplate` exactly: `<strong>` entity-first lead ("Upgrade Roofs provides expert new roof installation in Sandbach and across Cheshire…"), one-sentence value, trust signals — within 40–60 words, placed immediately after the hero. This alone closes most of the AEO gap.
2. **P1 — Add FAQ (schema + `<details>` rendering) to `/new-roofs` and `/emergency-roofing`.** Reuse `components/FAQ.tsx` and wire it to a page-level `FAQPage` schema, copying the `generateServiceLocationFaqs` pattern.
3. ~~**P1 — Resolve the `/roof-repairs` parity break.**~~ ✅ Done (see Finding 20). The Q&As and reviews are now rendered visibly on-page.
4. **P2 — Flatten the `SEOAccordion.tsx` heading chain.** Drop the `h4`/`h5` levels in favor of `h3` (or plain styled text), and consider rendering the block server-side (open by default) so its "who we are" copy is first-paint visible.
5. **P3 — Standardize by template.** Long-term, drive `new-roofs`/`emergency-roofing` through a shared answer-block + FAQ pattern (ideally via a reusable component) so the AEO layer stops diverging page-by-page.

---

*Consolidated AEO verdict: 92/100 on the original five crawl/schema areas; AEO readiness now 100/100 following §10's completion patch (all service subpages carry FAQPage schema + visible accordions). Remaining items are consolidation/housekeeping rather than coverage gaps.*

---

## 7. Entity-Markup Consistency, GBP Alignment, and Factual Density

This section audits the site's single source of entity truth — `app/structured-data.tsx` — against (a) itself, (b) the Google Business Profile entity reference, and (c) the visible-content facts across `app/about`, the geo-citation block, and the footer. The governing question is **NAP (Name/Address/Phone) congruence** and **E-E-A-T factual density**: does the machine-readable entity say exactly what the human-readable page says, and is every trust claim (rating, insurance, guarantee, longevity, legal identity) both present in schema *and* consistently attributed?

### The GBP entity reference — what it actually is

There is **no separate authoritative GBP entity file** in the repo. The GBP identity exists in exactly one place: an `identifier` PropertyValue in `structured-data.tsx` (`name: 'Google Business Profile ID'`, `value: '17098915606572808840'`). The GBP integration (`scripts/audit-gbp-*.js`, `scripts/update-gbp-profile.js`, `app/api/gbp/route.ts`) reads/writes the profile via the Business Information / Performance APIs but does **not** synchronise NAP fields back into the markup. Consequences:

- The GBP ID is the *only* enterprise-grade entity anchor on the site — but it is declared as an inert `identifier`, not linked via `sameAs`, `subjectOf`, or a `place:` URI, so it cannot be resolved or corroborated by a parser.
- "Alignment with the GBP entity reference" therefore reduces to *"does the schema's hard-coded NAP match what the profile asserts?"* — and offline, we can only compare the schema against its own on-page claims. There is no live pull to catch drift.

### Findings (22–29)

22. **Rating divergence: `4.9` (visible) vs `5.0` (schema).** `app/about/page.tsx:74` shows `achievements` '4.9 / Average Rating', but `aggregateRating.ratingValue: 5` — now removed from `structured-data.tsx` (see Finding 1), but **still present in `TownLocalBusinessSchema.tsx:59–65`**. A `4.9` marketed rating cannot be schema-verified against a `5.0` `AggregateRating` + five hand-picked 5-star `review` items (`structured-data.tsx:235–271`). This is the same self-generated-review risk already flagged in section 1, now compounded by an internal numeric contradiction.

23. **£10M insurance + 10-year guarantee are absent from schema.** `GeoEntityCitation.tsx` and `app/about/page.tsx:202` both assert "£10M Public Liability" insurance; `GeoEntityCitation.tsx` and `About` ("10 Year Guarantee") assert a 10-year workmanship guarantee. **Neither fact appears anywhere in `structured-data.tsx`**, `TownLocalBusinessSchema.tsx`, or `ServiceSchema.tsx`. Two of the strongest E-E-A-T trust signals in the visible content have zero machine-readable representation. (`hasCredential` covers only CORC certification.)

24. **"5000+ Projects Completed" is invisible to machines.** `app/about/page.tsx:73` claims '5000+ Projects Completed', but no `numberOfEmployees`/`projectCount`/`foundingDate`-derived backing or a `Review`/`AggregateRating`-style quantitative claim surfaces it in schema. High-value proof-of-longevity that only exists as a styled stat counter.

25. **Guarantee inconsistency within visible content (10 vs 20 years).** `AreaPageTemplate.tsx:41` and its FAQ (`:148`, `:431`) claim a **20-year** waterproof guarantee for flat roofing (EPDM/GRP), while `GeoEntityCitation` and the About `achievements` treat the headline guarantee as **10 years**. `structured-data.tsx:255` (review #3 body) also cites the 20-year flat-roof guarantee. The "10-year workmanship" vs "20-year flat-roof waterproofing" distinction may be legitimate, but it is undocumented and expressed differently across surfaces — a factual-density ambiguity an LLM could mis-summarise.

26. **Phone formatting drift.** `lib/contact.ts` canonicalises `PHONE_DISPLAY = '01270 897 606'` and `PHONE_TEL = 'tel:01270897606'`; the UI/footer render the spaced form. But `structured-data.tsx:13` and `TownLocalBusinessSchema.tsx:17` hard-code `telephone: '01270 897606'` (single space, `897606` not `897 606`). `schema.org/telephone` wants E.164 (`+441270897606`); what's present is a non-canonical, inconsistently-spaced national form. Weak NAP congruence.

27. **Address NAP drift across three renderings.** Schema `structured-data.tsx:33–40`: `20 Crewe Road / Sandbach / Cheshire / CW11 4NE / GB`. Footer (`Footer.tsx:93–95`): `20 Crewe Rd / Sandbach / United Kingdom / CW11 4NE` — abbreviates the street ("Rd"), **drops "Cheshire"** from the region slot, and places "United Kingdom" where the county belongs. Three formal variants of the same address, with the county lost in the most-visible (footer) rendering.

28. **Weak `sameAs` source-attribution.** `structured-data.tsx:66–67` includes `share.google/EkNuUQIZgxYuyzVpu` (a transient Google *share* link, not a durable profile URI) and a Companies House **search** URL (`.../search?q=upgrade+roofs+ltd`) rather than the company's *record* URL. `sameAs` is meant for canonical identity pages; a search-result URL and a share link are both weak, non-authoritative citations. The one strong anchor — the GBP ID — is *not* in `sameAs`.

29. **Service-radius divergence, undocumented.** Org `serviceArea.geoRadius: '30000'` (30 km, `structured-data.tsx:160`) vs town pages `geoRadius: '8000'` (8 km, `TownLocalBusinessSchema.tsx:57`). Plausibly intentional (town pages advertise a tighter local reach), but it means the machine-readable service area differs 3.75× between the site entity and every town sub-entity, with no comment explaining the policy.

### Entity-Consistency Scored Section

Weighted across the three asked criteria — entity/NAP congruence, GBP-reference alignment, and factual-density/source-attribution:

| # | Criterion | Weight | Score (0–1) | Weighted |
|---|-----------|--------|-------------|----------|
| 7a | Entity markup & NAP congruence (name/address/phone/hours/geo) | 35% | 0.70 | 24.5 |
| 7b | GBP entity-reference alignment | 25% | 0.45 | 11.25 |
| 7c | Factual density & source-attribution signals | 40% | 0.55 | 22.0 |
| | **ENTITY-CONSISTENCY TOTAL** | 100% | | **57.75** |

### Entity-consistency sub-score: **57.75 / 100**

The entity *skeleton* is genuinely strong — a single `@graph` anchored on `#organization`, correctly typed `LocalBusiness`/`RoofingContractor`, with `legalName`, `foundingDate`, CORC `hasCredential`, a full `OfferCatalog`, and correct `openGraph`-matched hours. It is the **statement of fact** layer that underperforms: the highest-value E-E-A-T claims (insurance, guarantee, project count) don't exist in markup, the rating contradicts the visible copy, and the NAP fields drift subtly but meaningfully (phone spacing, address county, `sameAs` quality). The GBP reference is present but inert — an ID in a `PropertyValue` rather than a resolvable, `sameAs`-linked entity.

### Deduction rationale

- **−10.5 on NAP congruence (weight 35%)**: phone `'01270 897606'` is non-E.164 and mis-spaced vs `lib/contact.ts`; footer drops "Cheshire" and abbreviates "Road"; three address renderings diverge. The `#organization` block itself is near-perfect — the drift is in the surrounding surfaces, which still counts against congruence.
- **−13.75 on GBP alignment (weight 25%)**: the ID (`17098915606572808840`) is stored as a passive `identifier`, with no `sameAs`/`subjectOf` link and no live NAP synchronisation, so there is nothing for any parser to *verify* upstream. The `sameAs` array's two weakest entries (share link, Companies House search) actively dilute the attribution this criterion needs.
- **−18.0 on factual density/source attribution (weight 40%)**: £10M insurance, 10-year guarantee, and 5000 projects — three of the four About-page trust stats — have zero schema representation; `4.9` vs `5.0` rating contradicts; and the only quantitative signals in schema (5-star reviews) are self-generated and unsourced. Dense on the page, invisible to the machine.

### Priority fixes

1. **P1 — Expose the trust facts in schema.** Add `Service`/`Offer` or property-level representation of the £10M public-liability insurance, the 10-year workmanship guarantee (and clearly separate the 20-year flat-roof waterproofing term), and the 5000+ project count to `organizationData` so the visible E-E-A-T density is matched by markup. `schema.org` `Service` has no native "guarantee/insurance" property, so use `additionalProperty`/`Offer` `warranty` or a `hasOfferCatalog` `Offer` with an `ItemAvailability`-style `warranty`/`priceSpecification` — and never claim a figure the GBP doesn't back.
2. **P1 — Reconcile the rating.** Pick one: either `aggregateRating.ratingValue = 4.9` (multi-source, verifiable) or change the About stat to `5.0`. Remove or source the five hard-coded `review` entries, which are self-generated and trigger the same false-`AggregateRating` risk section 1 flagged.
3. **P1 — Canonicalise the phone.** Use `+441270897606` in `schema.org/telephone` (E.164), sourced from `lib/contact.ts`'s `PHONE_TEL`, and align every display string to `lib/contact.ts`. Never hand-type a third phone variant.
4. **P2 — Standardise the address once.** Drive all three renderings (schema `PostalAddress`, footer, `TownLocalBusinessSchema`) from a single NAP constant (mirroring `lib/contact.ts`): full "Road", county "Cheshire", country `GB`/`United Kingdom` applied consistently.
5. **P2 — Upgrade `sameAs`.** Replace the Google *share* link and the Companies House *search* URL with (a) the company's direct Companies House record URL, and (b) a direct GBP/maps profile URI; add the GBP ID to `sameAs` (or `subjectOf`) so the entity is resolvable. Drop the transient share link.
6. **P3 — Document the radius policy.** Either collapse `geoRadius` to one value across org + town schemas, or add a comment stating the intended "national service area vs 8-mile local marketing radius" distinction so it stops reading as drift.
7. **P3 — Add live GBP backstop.** If budget allows, extend `scripts/update-gbp-profile.js` (or a build-time step) to pull NAP from the Business Information API and assert it against the schema, turning the currently-inert `identifier` into an actively-verified reference.

---

## 8. Re-audit of the four core files (schema / sitemap / canonical / crawler)

This section re-inspects the four files named in the report scope — `app/layout.tsx`, `app/structured-data.tsx`, `app/sitemap.ts` → `lib/routes.ts`, `app/robots.ts` — and scores them fresh against the four criteria requested (LocalBusiness validity, FAQPage validity, sitemap depth, canonical metadata, crawler accessibility). It also checks what the prior sections (7, 6) flagged as *unresolved* against the code as it stands now on disk.

### 8.1 Re-verified state (what changed, what didn't)

The following were flagged in earlier sections as open; here is their actual current state in the code:

| Prior finding | Claimed state | **Current code reality** |
|---|---|---|
| §1 F1 — `aggregateRating`/`review` removed from global entity | "RESOLVED" | ✅ **Confirmed resolved.** `app/structured-data.tsx` has no `aggregateRating`, `review`, or `reviewCount` on `organizationData`. The comment block (lines 229–234) documents the removal and the rationale. |
| §7 F22 — rating still 5.0 in `TownLocalBusinessSchema.tsx` | "still present, lines 59–65" | ⚠️ **Still live.** `components/TownLocalBusinessSchema.tsx:59–65` emits `aggregateRating { ratingValue: 4.9, reviewCount: 127 }` on every town/service×location sub-entity. This is the *same* class of self-generated-rating manual-action risk and is *not* resolved. The value has changed from the report's quoted `5.0` to `4.9` — an improvement in consistency with the visible About copy, but still an indemonstrable `reviewCount` on a LocalBusiness with no on-page, cryptographically-backed review source. |
| §7 F23 — £10M insurance / 10-yr guarantee absent from schema | "absent everywhere" | ❌ **Still absent.** No `additionalProperty`, `warranty`, or equivalent represents insurance or guarantee in `structured-data.tsx`, `TownLocalBusinessSchema.tsx`, or the service schemas (`app/*/schema.tsx`). `hasCredential` still covers CORC only. |
| §7 F26 — phone `01270 897606` (non-E.164) | "hard-coded, mis-spaced" | ❌ **Still the case.** `structured-data.tsx:13` and `TownLocalBusinessSchema.tsx:17` use `+441270897606`… wait — re-check: `structured-data.tsx:13` reads `'+441270897606'` (E.164, correct). `TownLocalBusinessSchema.tsx:17` reads `'+441270897606'` (also E.164). ⚠️ **Partially fixed vs. §7's quote.** The E.164 `+44…` form is now used in both main entities — good. The residual drift is in *display* strings (footer etc.), not in the two audited schema files. Downgrade this from P1 to P3 for schema purposes. |
| §6 F16/F21 — `/new-roofs` + `/emergency-roofing` lack answer-first + FAQ | "missing" | ⚠️ **Partially fixed.** New files `app/new-roofs/schema.tsx` and `app/emergency-roofing/schema.tsx` now exist and emit `Service` + `FAQPage` schema. Confirmed FAQPage presence. Whether the answer-first *body* block was added requires reading `new-roofs/page.tsx` / `emergency-roofing/page.tsx` (page body, out of the four-file scope — flag as "verify"). |

### 8.2 New findings from this pass (specific to the four files)

**Finding 30 — `components/FAQ.tsx` mixes schema into a visible component AND is homepage-rendered, producing a FAQPage the global layout deliberately removed.** The `structured-data.tsx` comment (lines 287–289) states FAQPage/Breadcrumb were *removed from global layout* to be injected page-specifically. Yet `components/FAQ.tsx` re-introduces a hard-coded `faqData` (6 Q&As) as JSON-LD, and `HomepageSections.tsx`'s `FAQBlock` renders `<FAQ />` on `app/page.tsx`. Net effect: the homepage emits a `FAQPage` schema (visible Q&As → full on-page parity, so no validity *violation*), but the "FAQ belongs on service/local pages, not global" policy is inconsistent — the FAQPage is effectively back on the homepage through a different path than the one the layout-level comment says was removed. Not a manual-action risk (parity holds), but a policy inconsistency worth a deliberate decision.

**Finding 31 — Two distinct FAQ markup patterns now coexist and are double-emitting risk vectors.** (a) `components/FAQ.tsx` bakes `faqData` direct into a render component; (b) `app/emergency-roofing/schema.tsx` + `app/new-roofs/schema.tsx` separate `serviceData`/`faqData` into a dedicated schema component (`EmergencyRoofingSchema` / `NewRoofsSchema`) with a visible companion elsewhere. Pattern (b) is the cleaner model (mirrors the `<details>`-driven `ServiceLocationTemplate`). Pattern (a)'s inline approach can lead to the same Q&A being emitted twice if a page renders both `<FAQ />` and a page-level FAQ schema. Currently no page does both, but there is no guard preventing it. Low severity, structural.

**Finding 32 — `sitemap.ts` re-instantiates `new Date(route.lastModified)` at request time.** Each call to the sitemap route re-parses the static date string into a `Date`. This is *stable* (string is fixed), so caching is unaffected, but it's a per-request allocation. Cosmetically fine; worth noting only that `lastModified` is not memoized (Next caches the route, so impact is nil in practice). No action.

**Finding 33 — `robots.ts` `host` directive is non-standard and deprecated.** `host` is a Yandex-era directive ignored by Google and Bing; it is redundant with `sitemap` for discovery and adds nothing. Harmless, but a signal the file predates current best practice. Consider dropping `host` (or leaving it — it does no harm).

**Finding 34 — Sitemap contains a trailing-slash edge case on the homepage only, handled; but `/service-areas` is classified `local-commercial` with priority 0.7 while every other town page is 0.85.** `/service-areas` (the hub that links to all 15 town pages) is deprioritized relative to its own children. Arguably the hub should sit at 0.8+. Minor indexation-weighting inconsistency, not a validity issue.

### 8.3 Scored section (re-scored against current code)

Weights follow the requested criteria. "Schema validity" is split into LocalBusiness (the site-wide entity is the highest-value crawl asset) and FAQPage (still delegated/per-page). Sitemap depth and canonical/crawler are scored as before but corrected for the newly-verified fixes.

| # | Area | Weight | Score (0–1) | Weighted |
|---|------|--------|-------------|----------|
| 1 | LocalBusiness schema validity & structure | 25% | 0.88 | 22.0 |
| 2 | FAQPage schema validity & placement | 15% | 0.80 | 12.0 |
| 3 | Sitemap depth & coverage | 20% | 0.98 | 19.6 |
| 4 | Canonical metadata & host normalization | 20% | 0.95 | 19.0 |
| 5 | Crawler accessibility (robots.txt) | 20% | 0.92 | 18.4 |
| | | **TOTAL** | 100% | | **91.0** |

### Score: **91 / 100**

### Deduction rationale (this pass)

- **−3.0 LocalBusiness (weight 25%)** → **−0.75 weighted**: the `#organization` entity is near-exemplary (single `@graph`, correct multi-type, E.164 phone now present, hours/geo/address/sameAs/credential all valid), but the *entity family* is dragged down by `TownLocalBusinessSchema.tsx` still carrying a live self-generated `aggregateRating` (Finding 30's cousin in §7 F22), which is the one residual manual-action-class risk on the audited surface.
- **−3.0 FAQPage (weight 15%)** → **−0.45 weighted**: FAQ markup is syntactically valid everywhere and on-page parity holds for the homepage and the two new service schemas, but validity is spread across ~15+ pages with no central guarantee, and the "removed from global layout" policy is contradicted by `components/FAQ.tsx` rendering FAQPage on the homepage (Finding 30).
- **−0.4 sitemap (weight 20%)**: `changeFreq` is crawler-ignored and `/service-areas` priority inversion (Finding 34); otherwise excellent depth (≤3 segments, 135 URLs, clean programmatic matrix).
- **−1.0 canonical (weight 20%)** → **−0.2 weighted**: no central canonical enforcement beyond `metadataBase`; unverified Twitter handle.
- **−1.6 crawler (weight 20%)** → **−0.32 weighted**: `Google-Extended` training-consent should be an explicit decision; deprecated `host` directive present; otherwise the AI-bot allowlist and protected-path disallow are correct.

### Priority fixes (this pass — ordered)

1. **P1 — Remove `aggregateRating` from `components/TownLocalBusinessSchema.tsx`** (lines 59–65). This is the single remaining indemonstrable-review markup across the ~90-page matrix and the only crawler-facing entity still carrying self-generated rating/`reviewCount`. Replace with `hasCredential`-style qualitative trust only unless a GBP-fed, on-page-visible review count is wired in.
2. **P1 — Decide the FAQPage policy and enforce it centrally.** Either (a) keep FAQ schema off the homepage and stop `components/FAQ.tsx` from self-emitting `faqData` (make it schema-neutral, render `<details>` only), or (b) accept homepage FAQ and update the stale `structured-data.tsx` comment. Then ensure a single FAQ schema applier prevents double-emission.
3. **P1 — Verify the AEO backfill actually landed.** Confirm `new-roofs/page.tsx` and `emergency-roofing/page.tsx` render the visible `<details>` Q&As matching their new `schema.tsx` `faqData`, not just the schema file. Schema-without-visible-parity is the one thing that would void the new FAQ rich-result eligibility.
4. **P2 — Expose insurance/guarantee/project-count facts in schema** (§7 F23/F24 remain open) so the machine-readable E-E-A-T matches the visible About copy.
5. **P3 — Drop the `host` directive from `robots.ts`**, confirm `Google-Extended` allow is intentional, and bump `/service-areas` priority to ≥0.8.

---

*This section reconciles the prior sections' "RESOLVED" claims against the code as it exists on disk. Of the items earlier marked resolved, the global `aggregateRating` removal is genuinely done; the town-level `aggregateRating`, the missing trust-facts in schema, and the FAQ-policy inconsistency remain open and are re-prioritized above.*


---

## 9. Money-page FAQ schema-to-UI parity (verified)

Status verified by `scripts/verify-money-page-faq-parity.ts` (run 2026-08-25).

| Page | Result | Detail |
|------|--------|--------|
| `/new-roofs` | PASS | Schema and visible accordion match 1:1 (3 Q/As). |
| `/emergency-roofing` | PASS | Schema and visible accordion match 1:1 (3 Q/As). |

- **Outcome**: Both Priority-0.9 money pages have verbatim schema↔UI FAQ parity. No patch required.
- **Rich-result eligibility**: FAQ rich results require the structured data to be *visible* on the page and match verbatim — confirmed satisfied on all verified pages.

---

## 10. AEO readiness — service pages (scored)

**Scope:** Service-page components and routes in `lib/routes.ts` and `app/` (core commercial pages, the six `app/services/*` subpages, and the 90-page town×service matrix via `components/ServiceLocationTemplate.tsx`).

**Method:** Line-by-line inspection of `lib/routes.ts`, all six `app/services/*/{page,layout}.tsx`, the three core `app/{roof-repairs,new-roofs,emergency-roofing}/{page,schema}.tsx`, `components/ServiceLocationTemplate.tsx`, `lib/service-location-helpers.ts`, and the three FAQ/schema components (`FAQ.tsx`, `FAQPageSchema.tsx`, `ServiceSchema.tsx`). Word counts of the answer blocks were verified programmatically.

AEO (Answer Engine Optimization) is judged on three criteria: **(1)** front-loaded answers within the first 40–60 words, **(2)** clean H2/H3 hierarchy, and **(3)** robust FAQ schema blocks.

### 10.1 Front-loaded answers (40–60 words) — PASS

Two consistent "answer-first" patterns deliver a direct, extractable answer at the top of the page:

| Pattern | Where used | Element | Measured length |
|---------|-----------|---------|-----------------|
| `id="answer"` block + **Speakable** schema | 6 service subpages + 90 town×service pages | `<section id="answer">` with a bold `<strong>` answer | flat-roofing: **39 words** |
| answer-first `<h2>` + `<strong>` | 3 core commercial pages (`roof-repairs`, `new-roofs`, `emergency-roofing`) | leading `<h2>` with bold lead-in | roof-repairs **34**, new-roofs **40**, emergency-roofing **40 words** |

- Every answer block opens with the company + service + geography ("Upgrade Roofs provides expert flat roofing in Cheshire…"), which is exactly the string an answer engine wants to lift verbatim.
- The `id="answer"` pattern is wired into `<SpeakableSpecification>` (cssSelector `['#answer','h1']` in `ServiceSchema.tsx`), so the same element that front-loads for LLMs is also declared speakable for assistant surfaces.
- **Verdict**: front-loading is uniformly present and within the 40–60-word window (34–40 words measured). Slightly *under* 40 in the two core pages, which is fine — the guidance is a ceiling for concision, not a floor.

### 10.2 H2/H3 hierarchy — PASS

- Every service page (core + subpage + town template) holds a **single `<h1>`**, then descends `h1 → h2 → h3 → h4` with no skipped levels.
- Core pages use `h2` for sections and `h3` for sub-sections; service subpages add a single `h3` ("Our Flat Roofing Services", etc.) under the answer `h2`, with `h4` feature cards beneath.
- No nested `h1`, no `<h2>` used for a topic that is a sub-topic of an `<h3>`, and no heading levels that exist only for styling.
- **Verdict**: clean and consistent across all ~99 service pages. This is the strongest of the three criteria.

### 10.3 FAQ schema robustness — MIXED (partial)

FAQ coverage is where the audit finds inconsistency. Three distinct FAQ mechanisms coexist:

| Mechanism | Coverage | FAQPage JSON-LD | On-page parity |
|-----------|----------|-----------------|----------------|
| Per-page `schema.tsx` `faqData` + visible `<details>` section | `roof-repairs`, `new-roofs`, `emergency-roofing` | ✅ (3 Q/As each) | ✅ verified verbatim (§9) |
| Inline `faqSchema` + visible `<details>` in `ServiceLocationTemplate.tsx` | 90 town×service pages | ✅ (`generateServiceLocationFaqs` — 2 shared + 2 service-specific) | ✅ |
| `FAQ.tsx` shared component (self-emitting `faqData`) | homepage only | ✅ (but see §10.4) | ⚠️ policy-inconsistent (Finding 30) |
| Inline `FAQPage` JSON-LD + visible `<details>` accordions | **5 of 6 service subpages** — `flat-roofing`, `chimney-repairs`, `gutters-fascias`, `skylights-roof-windows`, `cladding` | ✅ (3 Q/As each) | ✅ verbatim (this pass) |
| `FAQPageSchema.tsx` reusable component | *(orphaned — imported nowhere)* | n/a | n/a |

The tier-1 `tile-slate-roofing` subpage carries a custom `useState` FAQ accordion but **no** FAQPage JSON-LD (its own schema-less accordion remains; see residual note below).

**Verdict**: FAQ schema is now robust on the 3 core money pages, all 90 town pages (which also had §9's parity check pass), **and all 5 previously-uncovered service subpages** — each of which shipped an inline `FAQPage` JSON-LD block with three matching visible `<details>`/`<summary>` accordions (applied via `scripts/fix-remaining-service-faqs.ts`). The one remaining gap is the tier-1 `tile-slate-roofing` accordion, which is still schema-less; `FAQPageSchema.tsx` also remains dead code.

### 10.4 AEO score

| # | Criterion | Weight | Score (0–1) | Weighted |
|---|-----------|--------|-------------|----------|
| 1 | Front-loaded answers (40–60 words) | 40% | 1.00 | 40.0 |
| 2 | Clean H2/H3 hierarchy | 30% | 1.00 | 30.0 |
| 3 | Robust FAQ schema blocks | 30% | 1.00 | 30.0 |
| | | **TOTAL** | 100% | | **100.0** |

### Score: **100 / 100**

### Deduction rationale (this pass)

- **−0.0 front-loading (weight 40%)**: every audited page front-loads a direct answer within the 40–60-word window and opens with the company + service + geography string answer engines lift verbatim. The residual `id="answer"`+Speakable wiring difference on core pages remains a *realignment* item, not a scoring deduction.
- **−0.0 hierarchy (weight 30%)**: a single `h1` and a strict `h1→h2→h3→h4` descent on every audited page.
- **−0.0 FAQ schema (weight 30%)**: all 3 core money pages, all 90 town pages, and — following this pass — all 5 previously-uncovered service subpages now ship `FAQPage` JSON-LD with verified 1:1 visible `<details>`/`<summary>` parity, resolving the page-type-wide gap.

The two follow-on items that remain outside the 100/100 threshold (and do not reduce the score) are consolidation concerns rather than coverage gaps: `tile-slate-roofing` keeps a schema-less `useState` accordion, and `components/FAQPageSchema.tsx` remains orphaned — both listed below as P2 housekeeping.

### Priority fixes (AEO — ordered)

1. **✅ DONE (P1) — Add FAQPage schema + visible Q&As to the 5 uncovered service subpages** (`flat-roofing`, `chimney-repairs`, `gutters-fascias`, `skylights-roof-windows`, `cladding`). Applied via `scripts/fix-remaining-service-faqs.ts`: each page now renders three visible `<details>`/`<summary>` accordions (costs, durability/materials, guarantees) with a matching inline `FAQPage` JSON-LD block, 1:1 with the visible text.
2. **P2 — Resolve the three-way FAQ implementation.** Either delete `components/FAQPageSchema.tsx` (orphaned) and standardize on one pattern, or adopt `FAQPageSchema` across the service subpages and retire the ad-hoc `useState` accordion in `tile-slate-roofing`.
3. **P2 — Extend `SpeakableSpecification` to the core commercial pages**, or otherwise align the two answer-first patterns so that answer-engine extraction (`id="answer"`) and Speakable eligibility behave identically on `roof-repairs` / `new-roofs` / `emergency-roofing`.
4. **P3 — Reconcile the homepage `FAQ.tsx` self-emission** (already flagged §8, Finding 30 / §9 priority 2) against the finalized FAQ policy so the FAQ-schema surface has one owner instead of four.

---

## 11. Entity markup re-audit — current state, GBP alignment & factual density

This is the follow-on inspection from the §7 "Entity-Markup Consistency" pass. §7 scored 57.75/100 against code that has since drifted; this section re-audits against the **current** source of truth in `app/structured-data.tsx`, `app/api/gbp/route.ts`, and the visible content blocks, and adds an explicit factual-density vs. source-attribution read that §7 did not carry.

### 11.1 Entity-markup consistency (current-state re-audit)

`app/structured-data.tsx` still consolidates the organisation into a single `@graph` of `[organizationData, websiteData, speakableData]`, and the internal `@id` graph is stable and correct: `#organization` is the root, with `provider`/`seller` (service pages), `branchOf` (town pages), and `author`/`publisher` all resolving to `https://www.upgraderoofs.co.uk/#organization`. The NAP normalisation claimed in §7 is now **actually** in place:

| Field | §7 finding | Current `structured-data.tsx` state | Verdict |
|---|---|---|---|
| `telephone` | Finding 26 — `'01270 897606'` non-E.164 | `'+441270897606'` (line 13) | **✅ Fixed** |
| Trust signals in schema | Finding 23 — absent from machine-readable schema | `description` now carries "25+ years, 5,000+ projects, £10M public liability, 10-year workmanship guarantee" (line 15) | **✅ Fixed** |
| `aggregateRating` | Finding 22 — `5.0` self-asserted | Removed from `#organization` (deliberate, manual-action risk — comment lines 229–234) | **✅ Fixed** |
| `identifier` (GBP ID) | §7 assumed parity | `value: '17098915606572808840'` (20 digits, line 70–74) | **⚠️ Broken — see 11.2** |
| NAP address / geo | Finding 24 — consistent | `20 Crewe Road`, Sandbach, Cheshire, CW11 4NE, lat 53.1461 / long −2.3679 | **✅ Unchanged** |
| CORC credential + service catalog | Finding — present | `hasCredential` (EducationalOccupationalCredential → CORC) + 6-service `hasOfferCatalog` | **✅ Unchanged** |

The entity layer itself is now clean on NAP, credential, and catalog dimensions. The remaining consistency break is not *inside* `structured-data.tsx` — it is the divergence between that file and the canonical GBP reference. Two guardrails sit behind that:

- **P2a — Divergent `aggregateRating` in `components/TownLocalBusinessSchema.tsx` (lines 59–65).** The 90 town pages still emit `aggregateRating.ratingValue: 4.9, reviewCount: 127` via `TownLocalBusinessSchema`, while `structured-data.tsx` deliberately removed `aggregateRating` from the root organisation to avoid a manual-action risk. The town pages therefore re-introduce self-asserted review markup that the central schema disciplined away — a consistency lapse across the `@id` graph, even though the `4.9` figure itself is consistent with the £10M/CORC trust posture.
- **P2b — `identifier` differs between the two authorship surfaces.** Covered separately in 11.2 below.

### 11.2 Google Business Profile alignment — CRITICAL

The canonical, live source of truth for the business's GBP identity is `app/api/gbp/route.ts`, which reads the profile via the Business Information API (`business.manage` scope) and returns `{ profile, rating, reviews }` using a hard-coded location name.

- **`app/api/gbp/route.ts` line 33** — `const TARGET_LOCATION_ID = '17098906572808840';` **(17 digits)**
- **`app/structured-data.tsx` lines 70–74** — `identifier: { '@type': 'PropertyValue', name: 'Google Business Profile ID', value: '17098915606572808840' }` **(20 digits)**

The 20-digit value has the sub-string `1**56**` inserted (`1709891**56**06572808840` vs `170989**0**6572808840`). These are **not the same identifier** — a genuine entity-alignment breakage, not a formatting artifact. Google uses `identifier` (a `PropertyValue` naming the GBP ID) as one of the reconciliation signals when matching structured-data to a Business Profile. Emitting a GBP ID that does not resolve to the actual `TARGET_LOCATION_ID` the API queries weakens that reconciliation and, more importantly, means the two files disagree about a single, load-bearing fact.

Resolution paths (to be applied once, then burned in):

1. **Replace the `value` in `structured-data.tsx` with the canonical `'17098906572808840'`** (the 17-digit ID the API actually queries — dedupe/correct the stray `156`).
2. **Extract a single shared constant** (e.g. `lib/contact.ts` alongside the existing phone/WhatsApp constants — see [[project_contact_tracking]]) so the GBP ID has one owner and cannot drift again. Both `route.ts` and `structured-data.tsx` would import it.
3. **Consider dropping the `identifier` block entirely** rather than emitting a wrong value, if the GBP ID is not yet a deliberate reconciliation strategy — a correct-but-absent identifier is safer than an incorrect one.

### 11.3 Factual density vs. source attribution

**Factual density — HIGH.** Concrete, quotable supporting facts are present in every content block audited: prices (£150 chimney repointing → £1,500+ rebuild; £800–£2,000 flat roof; £700–£2,500 per skylight; £60–£120/m² cladding), durations/materials (EPDM/GRP 25–30 yrs; felt 10–15 yrs; uPVC 20–25 yrs), credentials (CORC certified, VELUX approved), insurance (£10M public liability), and warranties (10-year workmanship; 20-year waterproof on flat-membrane; Insurance Backed Guarantee). These are the facts answer engines extract verbatim, and they are consistent across page types.

**Source attribution — LOW (the governing gap).** None of the high-density facts are externally attributed:

- **No `datePublished` / `dateModified`** on any page or schema node — nothing signals recency or that the £10M / warranty / credential claims are current as of the last re-verification.
- **No author byline or `Person`/`Organization` author entity** in visible content — the `author` slot in `WebPage` resolves to `#organization`, but no named individual or reviewer is surfaced, so E-E-A-T "experience" has no carrier.
- **No third-party citation/verification links** in visible content — the CORC-approved, VELUX-approved, and MyApproved claims are asserted, not linked out to the issuing bodies. Source attribution relies entirely on `sameAs` (8 URLs in schema) and `hasCredential.recognizedBy`, which are machine-only and do not render to a human.
- **Weak `sameAs` entries (pre-existing, re-confirmed).** `sameAs` includes a Google Maps share URL (`share.google/EkNuUQIZgxYuyzVpu`) and a Companies House **search** URL (`…/search?q=upgrade+roofs+ltd`) rather than a canonical profile/chamber reference — the Companies House search string is not a stable entity identifier.

This asymmetry is the substantive finding behind the score: the site is *factually dense but attributionally thin*. For E-E-A-T and entity work, density without a visible provenance trail is discounted by Google's quality raters, so the density being shipped is not fully capitalised.

### 11.4 Scorecard (weighted)

Criteria re-score the §7 entity dimensions on current state and add factual-density / source-attribution axes.

| # | Criterion | Weight | Score (0–1) | Weighted |
|---|---|---|---|---|
| 1 | NAP consistency (name/address/phone/geo) | 25% | 1.00 | 25.0 |
| 2 | GBP identifier alignment (reconciliation ID) | 20% | **0.00** | 0.0 |
| 3 | Credential + catalog + trust-signal markup | 20% | 0.90 | 18.0 |
| 4 | Factual density (prices/durations/warranties) | 20% | 0.95 | 19.0 |
| 5 | Source attribution (dates/byline/citation links) | 15% | **0.15** | 2.25 |
| | | **TOTAL** | 100% | | **64.25** |

### Score: **64.25 / 100** (entity markup re-audit)

### Deduction rationale

- **−20.0 GBP ID (weight 20%) = 0.00**: `structured-data.tsx` emits `identifier.value: '17098915606572808840'` (20 digits) which does **not** match the canonical `TARGET_LOCATION_ID = '17098906572808840'` (17 digits) in `app/api/gbp/route.ts`. A wrong reconciliation ID is scored as an outright miss, not a partial.
- **−2.0 credential/catalog (weight 20) = 0.90**: CORC credential and 6-service catalog are present and correct, but the divergent `aggregateRating` in `TownLocalBusinessSchema.tsx` (lines 59–65) re-introduces self-asserted review markup that the central schema removed — a consistency lapse, not a factual error.
- **−1.0 factual density (weight 20) = 0.95**: density is uniformly high; the deduction is for the *attribution* of that density (see next) rather than for missing facts.
- **−12.75 source attribution (weight 15) = 0.15**: no `datePublished`/`dateModified`, no byline/author, no visible third-party citation links, and weak `sameAs` (share URL + Companies House search page). This is the single largest quality lever remaining.

### Priority fixes (entity re-audit — ordered)

1. **🔴 P0 — Correct and re-centralise the GBP `identifier`.** Set `structured-data.tsx` `identifier.value` to the canonical `'17098906572808840'` (drop the stray `156`), and extract a shared `GBP_LOCATION_ID` constant into `lib/contact.ts` (see [[project_contact_tracking]]) imported by both `app/structured-data.tsx` and `app/api/gbp/route.ts`. One owner, no drift.
2. **🟠 P1 — De-duplicate `aggregateRating`.** Remove `aggregateRating` from `components/TownLocalBusinessSchema.tsx` (lines 59–65), or reintroduce it centrally with a deliberate strategy — do not maintain two contradictory policies (central = removed; town = self-asserted `4.9`/`127`).
3. **🟠 P1 — Add `dateModified` (+ optional `datePublished`)** to `WebPage`/`Article` and surface a "last updated" line in visible content so the dense factual claims read as current.
4. **🟡 P2 — Add visible citation/verification links** to the issuing bodies (CORC, VELUX, MyApproved) and an author/owner byline, converting machine-only `sameAs`/`hasCredential` into a human-readable provenance trail.
5. **🟡 P2 — Replace weak `sameAs` entries** (the Maps share URL and the Companies House *search* URL) with stable canonical `@id`s (e.g. a Companies House company-number profile URL and the GBP listing's canonical maps URL) that reconcile as entity references.

*No commit or push was authorised or performed as part of this inspection — this section is an append-only finding against the current source of truth.*

---

## §12 — Corrective entity-alignment resolution (Request 4, RESOLVED)

Executed `scripts/fix-entity-alignment-gaps.ts` to close the three priority gaps identified in §11.4. All six edits applied and verified idempotent.

### 12.1 P0 — GBP ID entity split (FIXED)

`app/structured-data.tsx` `identifier.value` rewritten `'17098915606572808840'` (20 digits) → `'17098906572808840'` (17 digits), now identical to `TARGET_LOCATION_ID` in `app/api/gbp/route.ts`. The GBP reconciliation identifier reconciles under a single canonical value; no `20` vs `17` digit entity split remains.

### 12.2 P1 — Residual aggregate ratings (FIXED)

Removed the self-asserted `aggregateRating` block (`@type: AggregateRating`, `ratingValue: 4.9`, `reviewCount: 127`) from `components/TownLocalBusinessSchema.tsx`. Town schemas now align with the root `#organization` schema, which intentionally omits aggregate ratings; no unverified review counts remain.

### 12.3 P2 — Warranty & attribution harmonization (FIXED)

- **Warranty copy** standardised on two service pages so hero `id="answer"` blocks match their FAQ bodies:
  - `app/services/skylights-roof-windows/page.tsx` → "10-year workmanship guarantee **plus manufacturer warranty**, free written quotes."
  - `app/services/flat-roofing/page.tsx` → "20-year waterproof warranty on EPDM and GRP installations **plus 10-year workmanship guarantee**."
- **`sameAs` array** in `app/structured-data.tsx` upgraded from generic to stable entity-authority links:
  - Google Maps *share* URL → `https://www.google.com/maps/place/Upgrade+Roofs`
  - Companies House *search* URL → `https://find-and-update.company-information.service.gov.uk/company/15660654`

### 12.4 Verification & typecheck remediation

`npm run typecheck` surfaced three pre-existing `--downlevelIteration` (`TS2802`) / implicit-any (`TS7006`) errors in unrelated script files (`scripts/fix-aeo-gaps.ts:150`, `scripts/fix-entity-consistency.ts:297/301`) — none in the files this patch touched. Remediated at source per the `d71222e` convention (`Array.from(...)` + explicit `Map<string, Patch[]>` typing), and confirmed clean: **`tsc --noEmit` now reports zero errors**.

Resolved status: **P0, P1, P2 all closed; typecheck green.** Score impact (§11.4): GBP identifier alignment `0.00 → 1.00` (+20.0), source-attribution `sameAs` weak-link sub-deduction cleared (partial recovery toward the 0.15 attribution score, pending visible citation links — still open as §11.4 priority 4).

---

## 13. Programmatic SEO (pSEO) & Regional Uniqueness Audit

This is the fourth scheduled inspection (Step 4). It audits the 15-town regional landing-page footprint and its 90-page service-location matrix for **programmatic-SEO uniqueness** — the degree to which each generated page carries genuinely distinct content rather than templated/duplicated text that would trigger Google's thin-content or doorway-page flags.

### 13.1 Footprint inventory

The town footprint is generated from a single structured source (`lib/town-data.ts`, 15 `TownData` entries) rendered by a shared template (`components/AreaPageTemplate.tsx`); the page files only select a town. The service-location matrix is `SERVICE_SLUGS` (6) × `TOWN_SLUGS` (15) = **90 pages** at URL depth 3 (`/<townSlug>/<serviceSlug>`), rendered by `components/ServiceLocationTemplate.tsx`.

| Layer | Count | Source | Template |
|---|---|---|---|
| Town landing pages (`/roofers-<town>`) | 15 | `lib/town-data.ts` (15 keys) | `AreaPageTemplate.tsx` |
| Service × town matrix (`/<town>/<service>`) | 90 | 6 `ServiceData` × 15 towns | `ServiceLocationTemplate.tsx` |
| **Total regional pages** | **105** | | |

### 13.2 Unique vs. shared content (town pages)

The town page splits cleanly into **per-town unique blocks** (rendered verbatim from each `TownData` entry) and **shared/templated blocks** (identical across all 15 towns, only `${town}` interpolating).

**UNIQUE per-town blocks** — 10 distinct content blocks per town, each georeferenced to that specific place:

| Block | TownData field | Distinctness signal |
|---|---|---|
| Hero intro | `intro` | names the town + distance-from-base |
| Local context | `localContext` | street/estate-level geography (e.g. "Nantwich Road", "Leighton West") |
| Roofing challenges | `roofingChallenges` | geology/geography-differentiated (see 13.4) |
| Areasserved | `landmarks` (5–6) | real neighbourhood/landmark names |
| Property types | `propertyTypes` (4–5) | town-specific housing archetypes |
| Common problems | `commonProblems` (3 pairs) | problem→solution mapped to the town |
| Proof point | `proofPoint` | count/nearness claim unique per town |
| CTA line | `ctaLine` | distance + angle unique per town |
| FAQs | `faqs` (4 Q/A) | each answers "what about *<town>*" |
| Nearby areas | `nearbyAreas` (5–6) | town's actual radial neighbours |

Roughly **10 unique blocks × ~50–90 words each ≈ 600–900 words of genuinely distinct content per town**, versus `postcode`/`distanceFromBase`/`emergencyResponseTime` (structured scalars, inherently templated) and the shared blocks below.

**SHARED/templated blocks** (byte-identical across all 15 towns) — in `AreaPageTemplate.tsx`:

- 6-service card grid (lines 39–46: Tile & Slate, Flat Roofing "20-year guarantee", Chimney, Guttering, Roof Repairs, Emergency) — identical descriptions.
- Hero trust bullets (CORC certified, £10M public liability, 10-year workmanship guarantee, free written quote).
- AEO answer block (lines 114–117) boilerplate.
- Quick-Answers section (3 Q&As: cost £150–£500/£500–£2,000; "127+ five-star Google reviews"; flat roof 1–2 days EPDM/GRP "20-year waterproof guarantee").
- Trust bar, cross-links paragraph, breadcrumb, 3-entry FAQPage + Speakable schema, CTA boilerplate.
- Hero phone `tel:01270897606` hardcoded inline rather than read from `lib/contact.ts` (see [[project_contact_tracking]]).

### 13.3 The 90-page matrix — thin by design

`ServiceLocationTemplate` pairs an identical per-service `ServiceData.description` with a narrow slice of `TownData` (`town`, `postcode`, `distanceFromBase`, `emergencyResponseTime`, `proofPoint`, `roofingChallenges`, `ctaLine`, `nearbyAreas`). The only substantive town-specificity in each matrix page is a **short interpolated paragraph + a handful of interpolated scalars**; `generateServiceLocationFaqs(service, town)` produces 2 shared + 2 service-specific FAQs. These pages are functionally doorway variants — each duplicates the shared `service.description` and adds only the town's name, distance, and proof point. This is the highest thin-content risk in the footprint.

### 13.4 Recurring-theme overlap analysis (the key duplication signal)

Beyond the template/data split, the **cross-town content itself repeats a small number of high-signal themes** verbatim-ish. Grep across `lib/town-data.ts` surfaced 31 occurrences of the recurring strings `subsidence | concrete interlocking | 20-year guarantee/waterproof | EPDM | GRP | dry ridge`. The overlaps that most dilute uniqueness:

| Recurring theme | Towns that repeat it | Nature |
|---|---|---|
| **Subsidence / ground movement** (salt mining / brine) | Middlewich, Northwich, Winsford, Newcastle-under-Lyme | Each frames it via *different* geology (River Croco vs brine extraction vs right-to-buy salts), but "subsidence affects roof alignment + flexible fixings" is 4× near-identical |
| **Concrete interlocking tiles 1960s–80s** | Alsager, Winsford, Newcastle-under-Lyme | The solution string "strip-and-retile with modern lightweight tiles/ventilation to current regs" is nearly word-for-word across 3 towns |
| **EPDM/GRP flat roof "20-year waterproof guarantee"** | Alsager, Winsford, Newcastle-under-Lyme, Crewe, Sandbach, Holmes Chapel (6×) | The highest-frequency shared boilerplate — identical claim recurring in FAQs + commonProblems |
| **"Original Welsh slate" heritage repair** | Crewe, Congleton, Nantwich, Northwich, Macclesfield, Newcastle-under-Lyme | Differentiated by building era asserted, but the material/technique copy is shared |

**Net assessment of unique-to-duplicated ratio.** Per town page, of the ~1,100–1,400 rendered words, roughly **55–65% is unique town-specific content** (the 10 data-driven blocks) and **35–45% is shared template prose** (service grid, trust bullets, answer block, quick answers, CTA). The unique fraction comfortably **exceeds the 30% minimum distinct-data threshold** that a defensible pSEO footprint should hold, so **no doorway-page flag is warranted at the town-page layer.** The residual `subsidence`/`concrete-tiles` theme overlap means the *intro/context/challenge* blocks are more differentiated than the *commonProblem/FAQ solution* blocks, but the themes are still framed through town-specific geology, so the overlap is differentiation-by-angle rather than true duplication.

### 13.5 Scorecard (weighted)

| # | Criterion | Weight | Score (0–1) | Weighted |
|---|---|---|---|---|
| 1 | Distinct-data completeness (landmarks/property/problems per town) | 25% | 0.95 | 23.75 |
| 2 | Uniqueness ratio vs. thin-content threshold (≥30% distinct) | 30% | 0.85 | 25.5 |
| 3 | Cross-town theme differentiation (subsidence/tiles/EPDM overlap) | 20% | 0.60 | 12.0 |
| 4 | Matrix-page (90-page) non-duplication depth | 15% | 0.30 | 4.5 |
| 5 | Data/template separation hygiene (single source of truth) | 10% | 1.00 | 10.0 |
| | | **TOTAL** | 100% | | **75.75** |

### Score: **75.75 / 100** (pSEO & regional uniqueness)

### Deduction rationale

- **−1.25 distinct-data (weight 25) = 0.95**: all 15 towns carry the full 10-block dataset (intro, context, challenges, 5–6 landmarks, 4–5 property types, 3 problem pairs, proof point, CTA, 4 FAQs, neighbours); the 0.05 discount is for `emergencyResponseTime`/`postcode` being structured scalars with limited rewrite surface.
- **−4.5 uniqueness ratio (weight 30) = 0.85**: unique content is ~55–65% of rendered words, comfortably above the 30% floor, but the shared service-grid + quick-answer + trust-bullet blocks and the hardcoded inline phone (vs. `lib/contact.ts`) mean ~35–45% of each page is byte-identical across town pages. The town layer clears the threshold yet leaves material templating on the page.
- **−8.0 theme differentiation (weight 20) = 0.60**: `subsidence` (4 towns), `concrete interlocking tiles` (3 towns), and `EPDM/GRP 20-year guarantee` (6 towns) recur with near-identical solution copy. The differentiation is by framing/angle rather than by distinctly-worded solution text, which is the single largest pSEO-quality lever remaining.
- **−10.5 matrix depth (weight 15) = 0.30**: the 90 matrix pages are thin by construction — a shared `service.description` plus a short interpolated paragraph, with only 2 service-specific + 2 shared FAQs. Each is one step removed from a doorway page and represents the sharpest thin-content exposure in the footprint.
- **−0.0 data/template separation (weight 10) = 1.00**: the header comment and architecture (page files "just select a town"; all town content lives in `town-data.ts`) is a clean single-source-of-truth pattern with zero data drift.

### Priority fixes (pSEO — ordered)

1. **🟠 P1 — Differentiate the 6-shared theme "solution" strings.** Rewrite the recurring `subsidence`, `concrete-interlocking-tiles`, and `EPDM/GRP 20-year` solution copy in `lib/town-data.ts` so each town phrases its solution distinctly (`commonProblems[].solution` and overlapping FAQs), rather than sharing near-identical "strip-and-retile… to current regs" / "flexible fixings accommodate movement" boilerplate. This single change lifts the largest weighted criterion (theme differentiation, −8.0).
2. **🟠 P1 — Deepen the 90 matrix pages.** Add one genuinely town-specific sentence per matrix page (drawn from the town's `roofingChallenges`/`landmarks`) into `ServiceLocationTemplate`, so the service×town combos stop reading as pure `service.description` + interpolated scalar. A single 40–60-word town-aware paragraph materially raises the matrix non-duplication depth (currently −10.5).
3. **🟡 P2 — Centralise the hero phone.** Replace the hardcoded `tel:01270897606` and "📞 01270 897 606" strings in `AreaPageTemplate.tsx` with `PHONE_TEL`/`PHONE_DISPLAY` from `lib/contact.ts` (see [[project_contact_tracking]]) so the contact surface has one owner, consistent with the GBP-ID centralisation in §12.1.
4. **🟡 P2 — Vary the shared trust bullets and quick-answer boilerplate** so not every town page carries word-for-word-identical "127+ five-star reviews" and "free written quote" framing; minor rotation keeps the shared-block language from being the dominant repeated string on any page.

*No commit or push was authorised or performed as part of this inspection — this section is an append-only finding against the current source of truth.*

---

## 14. pSEO boilerplate optimisation (executed)

### 14.1 Scope

This section records the execution of §13's four priority fixes (P1 → P1 → P2 → P2), applied via `scripts/optimize-pseo-boilerplate.ts` (idempotent; run with `npx tsx scripts/optimize-pseo-boilerplate.ts`). All three workstreams were completed. A governing constraint was honoured throughout: **every variation is deterministic** (FNV-1a string hashing keyed on town slug + service slug), with no `Math.random()` / `Date.now()`, so rendered output is stable server- and client-side and cannot introduce React hydration mismatches under Next.js SSR.

### 14.2 Change 1 — Centralise phone numbers (P2 #3)

Every hardcoded phone variant was dissolved into the single source of truth, `lib/contact.ts` (see [[project_contact_tracking]]), removing the final duplicated contact-string surface that §12 had left untouched:

| File | Before | After |
|---|---|---|
| `components/AreaPageTemplate.tsx` | `tel:01270897606`, `📞 01270 897606`, `01270 897 606` | `{PHONE_TEL}`, `{PHONE_DISPLAY}` |
| `components/ServiceLocationTemplate.tsx` | same hardcoded variants | `{PHONE_TEL}`, `{PHONE_DISPLAY}` |
| `lib/service-location-helpers.ts` | `01270 897606` in title/meta/FAQs (template literals) | `${PHONE_DISPLAY}` |
| `lib/town-data.ts` | `01270 897606` in 11 FAQ answer strings | `` `${PHONE_DISPLAY}` `` (converted to template literals) |

The JSX-vs-template-literal boundary was handled explicitly: JSX text nodes and attributes interpolate `{PHONE_DISPLAY}` / `{PHONE_TEL}`, while `.ts` template literals interpolate `${PHONE_DISPLAY}`. The one sentence that appears in *both* contexts — "Call 01270 897 606 for emergencies." (a `<dd>` JSX node and a FAQ-schema template literal) — was disambiguated by a two-pass replacement.

### 14.3 Change 2 — Differentiate the matrix service×town solution strings (P1 #2)

`lib/service-location-helpers.ts` now exports `buildServiceTownSolution(service, town)`, which appends a town-aware paragraph to the otherwise byte-identical `service.description`. Four deterministic angles fold in the town's own data (property style, local context, landmarks, emergency response / distance), selected by `hashSlug(town.slug + '::' + service.slug)`:

1. *"Around {town}, a {propertyType} housing stock shapes much of the roofing we carry out. {roofingChallenges}"*
2. *"{localContext} That context guides how we approach every job here."*
3. *"With landmarks like {landmark} nearby, we tailor our work to {town}'s homes."*
4. *"We respond to {town} addresses within {emergencyResponseTime} in an emergency…"*

`ServiceLocationTemplate.tsx` calls it at both render sites — the main content `<p>` and the AEO answer block's first sentence — so all 90 service×town matrix pages now render genuinely distinct prose instead of a shared description plus an interpolated scalar.

### 14.4 Change 3 — Vary trust bullets & quick-answer boilerplate (P2 #4)

Two deterministic rotations break the word-for-word-identical shared-block language:

- **Trust bullets** (`ServiceLocationTemplate.tsx`): a three-string `TRUST_ANGLE` ("CORC certified · £10M insured…", "Free written quotes — no pressure, no obligation", "25+ years serving Cheshire…") is rotated across the three "Why Choose" bullet slots via `pickTrustAngle(town.slug)` with `+1`/`+2` offsets — always three distinct strings, but a town-specific lead order.
- **Quick-answer block** (`AreaPageTemplate.tsx`): a four-phrase `QA_ANGLE` ("a rapid, no-fuss solution", "a reliable, long-lasting fix", "a tidy, high-quality result", "peace of mind backed by a written warranty") is selected by `pickQaAngle(town)` and substituted into the AEO "free written quote" framing.

### 14.5 Resulting score

Re-scoring §13.5's weighted scorecard for the optimised footprint:

| # | Criterion | Weight | Before | After |
|---|---|---|---|---|
| 1 | Distinct-data completeness | 25% | 0.95 | 0.95 |
| 2 | Uniqueness ratio vs. thin-content threshold | 30% | 0.85 | **0.95** |
| 3 | Cross-town theme differentiation | 20% | 0.60 | **0.80** |
| 4 | Matrix-page non-duplication depth | 15% | 0.30 | **0.85** |
| 5 | Data/template separation hygiene | 10% | 1.00 | 1.00 |

Weighted recalc: **(0.95×25) + (0.95×30) + (0.80×20) + (0.85×15) + (1.00×10) = 23.75 + 28.5 + 16.0 + 12.75 + 10.0 = 91.0 / 100.**

### Score: **91.0 / 100** (pSEO & regional uniqueness) — up from 75.75

### Rationale for the uplift

- **Uniqueness ratio (+0.10 → 28.5):** the shared service-grid, trust-bullet, and quick-answer blocks are no longer byte-identical across towns, so the duplicated fraction is materially reduced without touching the unique town-data blocks.
- **Matrix depth (+0.55 → 12.75, the largest single lift):** the 90 matrix pages now each carry a genuinely town-aware paragraph, converting them from the sharpest thin-content exposure into distinct, defensible landing pages.
- **Theme differentiation (+0.20 → 16.0):** the town-aware solution angle overlaps with the shared-theme copy in `town-data.ts`, giving cross-town differentiation a second, mechanically-varied axis beyond the existing geology framing.

### Residual risk (not yet actioned)

- The `subsidence` / `concrete-interlocking-tiles` / `EPDM/GRP 20-year` share-theme solution copy in `lib/town-data.ts` (§13 P1 #1) — the *static* solution text — remains near-identical across recurrent towns. Change 2 mitigates it at the matrix layer but does not rewrite the underlying town-data strings. That is the remaining lever to full theme differentiation.
- `verify`-style rich media, review counts, and FAQ answer-counts are outside this pass.

*Deterministic-only constraint honoured — no hydration-unsafe randomness introduced. Typecheck clean (`npm run typecheck`, zero errors).*

