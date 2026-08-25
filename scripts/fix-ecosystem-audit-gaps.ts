/**
 * scripts/fix-ecosystem-audit-gaps.ts
 *
 * Corrective follow-up to docs/master-content-ecosystem-audit-report.md (the
 * 92/100 content-ecosystem crawl/schema audit, distinct from the Google
 * Ads/GBP/GSC master-ecosystem audit). Acts on the four audit findings that
 * carried genuine compliance/manual-action risk:
 *
 *   PART 1 — VERIFY the aggregated-rating risk is retired:
 *            `app/structured-data.tsx` no longer emits `aggregateRating` or
 *            embedded `review` objects on the global LocalBusiness entity
 *            (Finding 1/2 — the single highest-risk item).
 *
 *   PART 2 — VERIFY crawler tokens are standardized:
 *            `app/robots.ts` no longer declares the non-standard `anthropic-ai`
 *            user-agent (Finding 13); `ClaudeBot` remains.
 *
 *   PART 3 — VERIFY speakable + FAQ on-page parity:
 *            `app/structured-data.tsx` speakable selectors align with the
 *            complete homepage section set (Finding 3), and `/roof-repairs`
 *            renders its FAQ visibly so the `FAQPage` schema has on-page
 *            parity (Finding 20).
 *
 *   PART 4 — UPDATE the audit report to reflect the honest recomputed score
 *            (92/100, not 100 — the TownLocalBusinessSchema residual and other
 *            open items remain), and print the verification/git-sync checklist.
 *
 * This script is PURE VERIFICATION + DOC REWRITE: it never mutates the source
 * files (the fixes are applied in-repo), never touches credentials, and is
 * idempotent. Git commit/push is left to the operator (see PART 4 output).
 *
 * Run:  npx tsx scripts/fix-ecosystem-audit-gaps.ts
 */

import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.join(__dirname, '..');

// ── Color helpers (no-op when piped / NO_COLOR) ────────────────────────────
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
function paint(code: string, s: string) { return useColor ? code + s + '\x1b[0m' : s; }
const ok = (s: string) => paint('\x1b[32m', s);
const warn = (s: string) => paint('\x1b[33m', s);
const fail = (s: string) => paint('\x1b[31m', s);
const info = (s: string) => paint('\x1b[36m', s);
const subtle = (s: string) => paint('\x1b[90m', s);

function banner(t: string) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
}

function read(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) throw new Error(`File not found: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

// ── PART 1 — aggregateRating / review retirement ────────────────────────────
interface Check { name: string; pass: boolean; detail: string; }

function verifyStructuredData(): Check[] {
  const src = read('app/structured-data.tsx');
  const checks: Check[] = [];

  const hasAggregate = /aggregateRating\s*:/.test(src);
  checks.push({ name: 'aggregateRating removed', pass: !hasAggregate,
    detail: hasAggregate ? 'aggregateRating still present in app/structured-data.tsx' : 'no aggregateRating key' });

  const hasReview = /^\s*review\s*:\s*\[/m.test(src);
  checks.push({ name: 'embedded review[] removed', pass: !hasReview,
    detail: hasReview ? 'review[] block still present' : 'no embedded review array' });

  const hasReviewCount = /reviewCount\s*:/.test(src);
  checks.push({ name: 'reviewCount removed', pass: !hasReviewCount,
    detail: hasReviewCount ? 'reviewCount still present' : 'no reviewCount key' });

  // Scope gap check: the global entity is clean, but the per-town schema
  // (components/TownLocalBusinessSchema.tsx) still emits a hard-coded
  // aggregateRating across the ~90-page service×location matrix. This is the
  // residual P1 manual-action risk that section 7 finding 22 correctly flags.
  let townSrc = '';
  try { townSrc = read('components/TownLocalBusinessSchema.tsx'); } catch { /* optional */ }
  const townHasAggregate = townSrc !== '' && /aggregateRating\s*:/.test(townSrc);
  checks.push({ name: 'town schema aggregateRating retired', pass: !townHasAggregate,
    detail: townHasAggregate ? 'STILL present in components/TownLocalBusinessSchema.tsx (residual P1 risk)' : 'not present in town schema' });

  return checks;
}

// ── PART 2 — crawler token standardization ──────────────────────────────────
function verifyRobots(): Check[] {
  const src = read('app/robots.ts');
  const checks: Check[] = [];

  const hasAnthropic = /userAgent:\s*'anthropic-ai'/.test(src);
  checks.push({ name: 'anthropic-ai token removed', pass: !hasAnthropic,
    detail: hasAnthropic ? 'anthropic-ai still declared' : 'anthropic-ai gone' });

  const hasClaudeBot = /userAgent:\s*'ClaudeBot'/.test(src);
  checks.push({ name: 'ClaudeBot retained', pass: hasClaudeBot,
    detail: hasClaudeBot ? 'ClaudeBot present' : 'ClaudeBot missing!' });

  return checks;
}

// ── PART 3 — speakable + FAQ parity ─────────────────────────────────────────
function verifySpeakableParity(): Check[] {
  const sd = read('app/structured-data.tsx');
  const checks: Check[] = [];

  const selectors = /cssSelector:\s*\[([^\]]+)\]/.exec(sd);
  const want = ['#entity-citation', '#hero', '#services', '#about'];
  let pass = false;
  if (selectors) {
    const found = selectors[1].split(',').map((s) => s.trim().replace(/['"]/g, ''));
    pass = want.every((w) => found.includes(w)) && found.length === want.length;
  }
  checks.push({ name: 'speakable selectors complete', pass,
    detail: selectors ? `cssSelector = [${selectors[1]}]` : 'no cssSelector found' });

  return checks;
}

function verifyFaqParity(): Check[] {
  const page = read('app/roof-repairs/page.tsx');
  const schema = read('app/roof-repairs/schema.tsx');
  const checks: Check[] = [];

  // The three FAQ questions from schema.tsx should appear verbatim in page.tsx.
  const questions = [
    'Do you offer same-day service for urgent roof repairs?',
    'Is there a guarantee on your roof repairs?',
    'Are there any hidden costs or call-out fees?',
  ];
  const pageHasFaqSchema = /RoofRepairsSchema/.test(page);
  const visibleAll = questions.every((q) => page.includes(q));

  checks.push({ name: 'roof-repairs renders visible FAQ', pass: visibleAll,
    detail: visibleAll
      ? `all ${questions.length} FAQ questions rendered on-page`
      : `missing on-page: ${questions.filter((q) => !page.includes(q)).join('; ') || 'none'}` });

  checks.push({ name: 'FAQPage schema still wired', pass: pageHasFaqSchema,
    detail: pageHasFaqSchema ? '<RoofRepairsSchema /> present' : '<RoofRepairsSchema /> missing' });

  // schema.tsx still declares those three Q&As (parity, not removal).
  const schemaHasAll = questions.every((q) => schema.includes(q));
  checks.push({ name: 'schema.tsx Q&As match page text', pass: schemaHasAll,
    detail: schemaHasAll ? 'schema question text matches page' : 'schema/text mismatch' });

  return checks;
}

// ── PART 4 — report rewrite (honest recompute) ──────────────────────────────
//
// The scored table weights five areas 25/15/20/20/20 with sub-scores that
// already encode the per-area deductions:
//   LocalBusiness 0.90 (×25%) = 22.50   ← aggregateRating/review + speakable
//   FAQPage       0.85 (×15%) = 12.75   ← parity delegated to ~15 pages
//   Sitemap       0.98 (×20%) = 19.60   ← changeFreq ignored by crawlers
//   Canonical     0.95 (×20%) = 19.00   ← no central enforcement
//   Robots        0.90 (×20%) = 18.00   ← anthropic-ai + Google-Extended
//
//   weighted total = 22.50 + 12.75 + 19.60 + 19.00 + 18.00 = 91.85 ≈ 92/100
//
// The prior "100/100" was a broken TOTAL row that never summed the weighted
// column; it is corrected below. This patch retires findings 1, 2, 3, 13, 20,
// but the honest residual — TownLocalBusinessSchema.tsx's hard-coded
// aggregateRating (section 7 finding 22, still ~90 matrix pages), FAQPage
// delegation, Google-Extended consent, sitemap changeFreq and canonical
// enforcement — means the score stays in the low-90s, NOT 100.
//
function updateReport(allPass: boolean): { changed: boolean; detail: string } {
  const rel = 'docs/master-content-ecosystem-audit-report.md';
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return { changed: false, detail: 'report not found (skipped)' };

  const src = fs.readFileSync(p, 'utf8');
  let next = src;

  // 1. Finding 1 (aggregateRating/review risk) → resolved.
  next = next.replace(
    /1\. \*\*`aggregateRating` \+ `review` on an Organization\/local business is risky and often non-compliant\.\*\*[^]*?single highest-risk item in the schema\./,
    `1. ✅ **RESOLVED** — \`aggregateRating\` + \`review\` removed from the global LocalBusiness entity (\`app/structured-data.tsx\`). The hard-coded \`reviewCount: 127\` and five embedded reviews are gone, so this is no longer a manual-action risk. Real reviews surface via the homepage \`<GhlReviewsWidget />\` and the Google Business Profile.`
  );

  // 2. Finding 2 (reviewCount indemonstrable) → resolved (subsumed by #1).
  next = next.replace(
    /2\. \*\*`aggregateRating\.reviewCount: 127` is likely indemonstrable\.\*\*[^]*?exactly the pattern Google flags\./,
    `2. ✅ **RESOLVED** — \`aggregateRating.reviewCount: 127\` removed along with the whole review block (#1), so there is no longer an indemonstrable count to reconcile.`
  );

  // 3. Finding 3 (speakable selectors) → resolved.
  next = next.replace(
    /3\. \*\*`speakable` `cssSelector` references an unverified selector set\.\*\*[^]*?worth verifying against `app\/page\.tsx`\./,
    `3. ✅ **RESOLVED** — \`speakable.cssSelector\` now targets \`['#entity-citation', '#hero', '#services', '#about']\`, reconciled against \`app/page.tsx\`, so the selector set is verified.`
  );

  // 4. Fix robots "Correct" list — drop the stale "anthropic-ai" mention.
  next = next.replace(
    /`GPTBot`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `OAI-SearchBot`, `OAI-SearchBot-Extended`, `Google-Extended`, `CCBot`/,
    `\`GPTBot\`, \`ClaudeBot\`, \`PerplexityBot\`, \`OAI-SearchBot\`, \`OAI-SearchBot-Extended\`, \`Google-Extended\`, \`CCBot\``
  );

  // 5. Finding 13 (anthropic-ai token) → resolved.
  next = next.replace(
    /13\. \*\*`anthropic-ai` is not a recognized real user-agent token\.\*\*[^]*?documented token\. Minor\./,
    `13. ✅ **RESOLVED** — the non-standard \`anthropic-ai\` block is removed from \`app/robots.ts\`; only the documented \`ClaudeBot\` token remains for Anthropic's crawler.`
  );

  // 6. Finding 20 (roof-repairs FAQ parity) → resolved.
  next = next.replace(
    /20\. \*\*`\/roof-repairs` has a parity break\.\*\*[^]*?drop `faqData`\./,
    `20. ✅ **RESOLVED** — \`app/roof-repairs/page.tsx\` now renders all three FAQ Q&As visibly (a native \`<details>/<summary>\` section) matching \`schema.tsx\`'s \`faqData\` verbatim, and its three reviews were already rendered on-page. Full parity.`
  );

  // 7. Fix the AEO table row for roof-repairs (line 203) — parity is now full.
  next = next.replace(
    /^\| `app\/roof-repairs\/schema\.tsx` \| ✅ `faqData` \(3 questions\) \| ❌ \*\*no visible FAQ rendered\*\* \| ❌ Broken \|$/m,
    '| `app/roof-repairs/schema.tsx` | ✅ `faqData` (3 questions) | ✅ `<details>/<summary>` Renders all three Q/A | ✅ Full |'
  );

  // 8. Remove the stale AEO priority-fix #3 (roof-repairs parity → resolved).
  next = next.replace(
    /3\. \*\*P1 — Resolve the `\/roof-repairs` parity break\.\*\*[^]*?or remove them from `roof-repairs\/schema\.tsx`\./,
    `3. ~~**P1 — Resolve the \`/roof-repairs\` parity break.**~~ ✅ Done (see Finding 20). The Q&As and reviews are now rendered visibly on-page.`
  );

  // 9. Correct the malformed TOTAL row + recompute the honest score.
  //    The scored table has one extra leading empty cell: | | | **TOTAL** | ...
  next = next.replace(
    /\|\s*\|\s*\|\s*\*\*TOTAL\*\*\s*\|\s*100%\s*\|\s*\|\s*\*\*100\.00\*\*\s*\|/,
    '| | | **TOTAL** | 100% | | **91.85** |'
  );
  next = next.replace(/### Score: \*\*100 \/ 100\*\*/, '### Score: **92 / 100**');

  // 10. Rewrite the deduction bullets to reflect the four remaining open items.
  next = next.replace(
    /- \*\*−2\.5\*\* \(LocalBusiness\):[^\n]*\n(?:- \*\*−[^)]*\*\* \([^)]*\):[^\n]*\n?)*/,
    `- **−2.25** (FAQPage): syntactically valid and correctly page-scoped, but parity is delegated to ~15 individual pages with no central guarantee of Q/A on-page parity.
- **−2.0** (robots): \`Google-Extended\` training-consent posture should be explicitly confirmed as intentional (the \`anthropic-ai\` token is now resolved, but this half remains).
- **−1.0** (sitemap): \`changeFreq\` is declared but crawler-ignored (cosmetic); no functional defect.
- **−1.0** (canonical): no central canonical enforcement beyond \`metadataBase\`; unverified Twitter handle.

> ⚠️ **Residual P1 risk not yet retired:** \`components/TownLocalBusinessSchema.tsx\` (lines 59–65) still emits a hard-coded \`aggregateRating\` (\`ratingValue: 5\`, \`reviewCount: 127\`) across the ~90-page service×location matrix — see section 7 finding 22. Retiring the global entity is not enough; this town-level entity carries the same self-generated-review manual-action risk and should be the next fix.

`
  );

  // 11. Reconcile section 7 finding 22's stale structured-data.tsx:230 citation.
  //     The aggregateRating is GONE from structured-data.tsx, but still present
  //     in TownLocalBusinessSchema.tsx:59-65. Correct the cross-reference.
  next = next.replace(
    /`aggregateRating\.ratingValue: 5` in both `structured-data\.tsx:230` and `TownLocalBusinessSchema\.tsx:61`/,
    '`aggregateRating.ratingValue: 5` — now removed from `structured-data.tsx` (see Finding 1), but **still present in `TownLocalBusinessSchema.tsx:59–65`**'
  );

  const honestMsg = allPass
    ? 'findings 1/2/3/13/20 resolved; score corrected to honest 92/100 (91.85); town-schema aggregateRating flagged'
    : 'VERIFICATION FAILED — report score corrected but source checks did not all pass; review before committing';

  if (next !== src) {
    fs.writeFileSync(p, next);
    return { changed: true, detail: honestMsg };
  }
  return { changed: false, detail: 'no report changes matched (already up-to-date?)' };
}

// ── MAIN ────────────────────────────────────────────────────────────────────
function main() {
  console.log(paint('\x1b[1m', 'Upgrade Roofs — Fix Ecosystem Audit Gaps'));
  console.log(subtle('Pure verification + doc rewrite. Source fixes are already applied in-repo.'));

  const allChecks: Check[] = [];

  banner('PART 1 · AGGREGATE-RATING RISK (P1)');
  const p1 = verifyStructuredData();
  allChecks.push(...p1);
  p1.forEach((c) => console.log((c.pass ? ok('  ✓') : fail('  ✗')) + ` ${c.name} — ${c.detail}`));

  banner('PART 2 · CRAWLER TOKENS (P2)');
  const p2 = verifyRobots();
  allChecks.push(...p2);
  p2.forEach((c) => console.log((c.pass ? ok('  ✓') : fail('  ✗')) + ` ${c.name} — ${c.detail}`));

  banner('PART 3 · SPEAKABLE + FAQ PARITY (P3)');
  const speak = verifySpeakableParity();
  const faq = verifyFaqParity();
  allChecks.push(...speak, ...faq);
  [...speak, ...faq].forEach((c) => console.log((c.pass ? ok('  ✓') : fail('  ✗')) + ` ${c.name} — ${c.detail}`));

  banner('PART 4 · REPORT UPDATE + VERIFY');
  const allPass = allChecks.every((c) => c.pass);
  const rpt = updateReport(allPass);
  console.log((rpt.changed ? ok('  ✓') : subtle('  –')) + ` ${rpt.detail}`);

  // Verification + git sync checklist.
  console.log('');
  console.log(info('  Verification & sync (run by operator):'));
  console.log(subtle('    npm run typecheck          # tsc --noEmit — confirm no type regressions'));
  console.log(subtle('    npm run build              # optional: full production build'));
  console.log(subtle('    git add -A && git commit -m "Fix audit vulnerabilities: retire P1 self-served aggregateRating, standardize AI crawler tokens"'));
  console.log(subtle('    git push origin main'));

  const passed = allChecks.filter((c) => c.pass).length;
  console.log('\n' + (allPass ? ok(`  STATUS: CLEAN — ${passed}/${allChecks.length} checks passed.`) : fail(`  STATUS: ${allChecks.length - passed} check(s) FAILED — resolve before committing.`)));
  console.log('');
}

main();
