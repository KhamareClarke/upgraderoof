# Master Content Ecosystem Audit Report

**Scope:** `app/layout.tsx`, `app/structured-data.tsx`, `app/sitemap.ts`, `app/robots.ts` (plus their transitive dependencies: `lib/routes.ts`, `lib/contact.ts`, and page-level schema components referenced by `structured-data.tsx`).

**Audited:** 2026-08-25

**Method:** Line-by-line code inspection. Findings are grouped by review area, then consolidated into a scored section out of 100.

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

1. **`aggregateRating` + `review` on an Organization/local business is risky and often non-compliant.** Google's structured-data policies for *local businesses* have long discouraged (and intermittently penalized/warned) self-serving `aggregateRating` and embedded `Review` markup — Google specifically displays rating stars from *first-party* reviews only for certain types (e.g. `Product`, `LocalBusiness` under narrow conditions), and `Review`/`aggregateRating` on `LocalBusiness` is a documented source of manual-action risk when the reviews are not independently sourced and verifiably visible on the page. Here the `reviewCount: 127` and the five embedded reviews are hard-coded in the layout and **not backed by visible on-page review content or a visible review widget** — they exist only in JSON-LD. This is the single highest-risk item in the schema.

2. **`aggregateRating.reviewCount: 127` is likely indemonstrable.** The `sameAs`/Business Profile shows a specific GBP ID, but there is no on-page reviews section with 127 visible reviews on the homepage to substantiate the count. A mismatch between markup and visible content is exactly the pattern Google flags.

3. **`speakable` `cssSelector` references an unverified selector set.** `['#hero', '#services', '#about']` — these IDs must exist on the homepage or the `SpeakableSpecification` is invalid/ignored (and `#about` looks suspicious for a homepage — the About section may not have that ID). This is a low-severity dead-reference risk; worth verifying against `app/page.tsx`.

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
- **AI crawler opt-in/opt-out is deliberate.** The file explicitly lists `GPTBot`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `OAI-SearchBot`, `OAI-SearchBot-Extended`, `Google-Extended`, `CCBot` — all with `allow: '/'`, and (for the search-targeting ones) the same protected-path exclusions. This is a considered decision: the site allows LLM/AI-crawler indexing of content while still hiding `/api/`, `/admin/`, `/thank-you`.

### Issues

13. **`anthropic-ai` is not a recognized real user-agent token.** Anthropic's crawler user-agent string is `ClaudeBot` (and historically `anthropic-ai` was hypothesized but is not an official published token). Including `anthropic-ai` alongside `ClaudeBot` is harmless (ignored by crawlers that don't use it) but signals possible confusion; only `ClaudeBot` is the documented token. Minor.

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
| | **TOTAL** | 100% | | **91.85** |

### Score: **92 / 100**

### Deduction rationale

- **−2.5** (LocalBusiness): the embedded `aggregateRating` + `review` on a local business without visible, independently-verifiable on-page review content is the principal compliance risk; `speakable` CSS selectors unverified.
- **−2.25** (FAQPage): syntactically valid and correctly page-scoped, but validity is delegated to ~15 individual pages with no central guarantee of Q/A on-page parity.
- **−2.0** (robots): `anthropic-ai` is a non-standard token; `Google-Extended` training-consent posture should be explicitly confirmed as intentional.
- **−1.0** (sitemap): `changeFreq` is declared but crawler-ignored (cosmetic); no functional defect.
- **−1.0** (canonical): no central canonical enforcement beyond `metadataBase`; unverified Twitter handle.

### Priority fixes (highest → lowest impact)

1. **P1 — Reconcile `aggregateRating`/`review` in `structured-data.tsx`.** Either (a) render the 127 reviews visibly on the homepage and link them to the GBP, or (b) remove `aggregateRating`/`review` from the layout-level graph until on-page visibility exists. This is the only item with genuine manual-action risk.
2. **P1 — Verify FAQ on-page parity** across all pages importing `FAQPageSchema` / a `faqData` block, since a visible-Q/A mismatch voids the FAQ rich result (and Google deprecated FAQ rich results for most sites — confirm the markup is still delivering value vs. effort).
3. **P2 — Verify `speakable` selectors** `#hero`, `#services`, `#about` exist on `app/page.tsx`, or remove `speakableData`.
4. **P2 — Confirm `Google-Extended` allow** is a deliberate training-consent decision; remove the non-standard `anthropic-ai` token (keep `ClaudeBot`).
5. **P3 — Replace the Yahoo email** in the public JSON-LD with a domain-aligned address to reduce scraping and improve trust signals.

---

*Generated by code-level inspection. On-page FAQ parity, live `speakable` selector resolution, and Twitter-handle verification require runtime/page-content validation outside the four audited files.*
