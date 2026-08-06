# SEO Page-Role Map — Upgrade Roofs

> Every page on the site has a defined SEO role. This document is the single source of truth for what each page targets, how it ranks, and how it connects to the rest of the site.

---

## 1. Money Pages (Core Commercial)

These are the highest-value pages. They target Cheshire-wide commercial keywords and are the primary conversion targets.

| Page | URL | Target Keywords | Geographic Scope | Robots | Schema |
|------|-----|-----------------|-----------------|--------|--------|
| Roof Repairs | `/roof-repairs` | roof repairs Cheshire, roof leak repair | Cheshire (county) | index, follow | LocalBusiness |
| New Roofs | `/new-roofs` | new roofs Cheshire, re-roofing | Cheshire (county) | index, follow | LocalBusiness |
| Emergency Roofing | `/emergency-roofing` | emergency roofer Cheshire, 24/7 roof repair | Cheshire (county) | index, follow | LocalBusiness |

**Internal linking rules:**
- Money pages link DOWN to town pages (via ServiceAreaLinks + contextual paragraph)
- Money pages link ACROSS to each other (e.g. roof-repairs links to emergency-roofing and new-roofs)
- Money pages link to relevant blog posts (informational support)

---

## 2. Town Pages (Local Commercial)

Each town page targets a specific town for "roofers [town]" keywords. Content is unique per town, sourced from `lib/town-data.ts`.

| Page | URL | Postcode | Distance | Robots | Data Source |
|------|-----|----------|----------|--------|-------------|
| Sandbach | `/roofers-sandbach` | CW11 | Base | index, follow | Custom page |
| Crewe | `/roofers-crewe` | CW1/CW2 | 4 miles | index, follow | `townData.crewe` |
| Middlewich | `/roofers-middlewich` | CW10 | 3 miles | index, follow | `townData.middlewich` |
| Congleton | `/roofers-congleton` | CW12 | 6 miles | index, follow | `townData.congleton` |
| Nantwich | `/roofers-nantwich` | CW5 | 8 miles | index, follow | `townData.nantwich` |
| Alsager | `/roofers-alsager` | ST7 | 5 miles | index, follow | `townData.alsager` |
| Holmes Chapel | `/roofers-holmes-chapel` | CW4 | 4 miles | index, follow | `townData['holmes-chapel']` |

**Uniqueness signals per town:**
- Landmarks and neighbourhoods
- Property types typical to the area
- Common roofing problems with solutions
- Local proof point (e.g. "50+ jobs in CW1")
- Town-specific CTA line
- Postcode, distance, emergency response time

**Internal linking rules:**
- Town pages link UP to money pages (via AreaPageTemplate services section)
- Town pages link ACROSS to nearby town pages (via nearbyAreas)

---

## 3. Service Sub-Pages (Supporting Commercial)

| Page | URL | Robots |
|------|-----|--------|
| All Services | `/services` | index, follow |
| Tile & Slate | `/services/tile-slate-roofing` | index, follow |
| Flat Roofing | `/services/flat-roofing` | index, follow |
| Chimney Repairs | `/services/chimney-repairs` | index, follow |
| Gutters & Fascias | `/services/gutters-fascias` | index, follow |
| Skylights | `/services/skylights-roof-windows` | index, follow |
| Lead Work | `/services/lead-work` | index, follow |

---

## 4. Blog Posts (Informational / Topical Authority)

Blog posts support money pages by building topical authority and providing internal link targets.

| Post | URL | Published | Links to Money Pages |
|------|-----|-----------|---------------------|
| Emergency Roof Repairs | `/blog/emergency-roof-repairs` | 2026-03-15 | /roof-repairs, /emergency-roofing |
| Roof Maintenance Checklist | `/blog/roof-maintenance-checklist` | 2026-03-10 | /roof-repairs, /emergency-roofing |
| How Long Does a Roof Last | `/blog/how-long-does-roof-last` | 2026-03-08 | /roof-repairs, /new-roofs |
| Gutter Maintenance Guide | `/blog/gutter-maintenance-guide` | 2026-03-05 | /roof-repairs, /emergency-roofing |
| Chimney Repair Guide | `/blog/chimney-repair-guide` | 2026-03-01 | /roof-repairs, /emergency-roofing |
| Choosing a Contractor | `/blog/choosing-roofing-contractor` | 2026-02-25 | /roof-repairs, /new-roofs, /emergency-roofing |
| Skylight Installation | `/blog/skylight-installation-guide` | 2026-02-20 | /new-roofs, /roof-repairs |
| Flat Roof Problems | `/blog/flat-roof-problems` | 2026-02-15 | /roof-repairs, /emergency-roofing, /new-roofs |
| Flat vs Tile Roofs | `/blog/flat-vs-tile-roofs` | 2024-11-04 | /new-roofs, /roof-repairs |
| Roof Damage Signs | `/blog/roof-damage-signs` | 2024-11-04 | /roof-repairs, /emergency-roofing, /new-roofs |

**All blog posts have:** Article JSON-LD schema via `BlogArticleSchema` component.

---

## 5. Offer Pages (PPC Landing Pages)

These are ads-only landing pages. They are **noindex** to prevent cannibalisation with organic town pages.

| Page | URL | Robots |
|------|-----|--------|
| Offer Cheshire | `/offer-cheshire` | **noindex**, follow |
| Offer Sandbach | `/offer-sandbach` | **noindex**, follow |
| Offer Crewe | `/offer-crewe` | **noindex**, follow |
| Offer Middlewich | `/offer-middlewich` | **noindex**, follow |
| Offer Congleton | `/offer-congleton` | **noindex**, follow |
| Offer Nantwich | `/offer-nantwich` | **noindex**, follow |
| Offer Alsager | `/offer-alsager` | **noindex**, follow |
| Offer Holmes Chapel | `/offer-holmes-chapel` | **noindex**, follow |
| Special Offer | `/special-offer` | **noindex**, follow |

---

## 6. Utility / Non-Ranking Pages

| Page | URL | Robots |
|------|-----|--------|
| Homepage | `/` | index, follow |
| Contact | `/contact` | index, follow |
| Service Areas | `/service-areas` | index, follow |
| Thank You | `/thank-you` | **noindex**, nofollow |
| Privacy Policy | `/privacy-policy` | noindex, follow |

---

## Internal Linking Hierarchy

```
Homepage
  |
  +-- Money Pages (Cheshire-wide)
  |     |-- /roof-repairs      --> blog posts, town pages
  |     |-- /new-roofs          --> blog posts, town pages
  |     |-- /emergency-roofing  --> blog posts, town pages
  |
  +-- Town Pages (local)
  |     |-- /roofers-sandbach   --> money pages, nearby towns
  |     |-- /roofers-crewe      --> money pages, nearby towns
  |     |-- /roofers-middlewich  --> money pages, nearby towns
  |     |-- /roofers-congleton  --> money pages, nearby towns
  |     |-- /roofers-nantwich   --> money pages, nearby towns
  |     |-- /roofers-alsager    --> money pages, nearby towns
  |     |-- /roofers-holmes-chapel --> money pages, nearby towns
  |
  +-- Blog Posts (informational)
  |     |-- Each post links UP to 2-3 money pages
  |     |-- Related articles link ACROSS to other blog posts
  |
  +-- Service Sub-Pages (supporting)
  |     |-- Link UP to money pages
  |
  +-- Offer Pages (PPC only, noindex)
```

---

## Key Principles

1. **Geographic alignment**: Money pages target Cheshire (county). Town pages target individual towns. Never mix.
2. **Content uniqueness**: Every town page has unique landmarks, property types, problems, and proof points from `town-data.ts`.
3. **No cannibalisation**: Offer pages are noindex. Each page has a unique primary keyword target.
4. **Schema**: Blog posts have Article schema. Service pages have LocalBusiness schema via site-wide config.
5. **Canonical URLs**: Every indexable page has a canonical URL set.
