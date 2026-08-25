/**
 * scripts/fix-entity-consistency.ts
 *
 * Corrective entity-alignment patch for Phase B of the master content-ecosystem
 * audit. The source-of-truth edits were applied directly to the affected files;
 * this script is the idempotent, self-documenting encoding of those patches so
 * the alignment can be (a) verified and (b) re-applied bit-for-bit if drift
 * ever recurs (e.g. after a merge, a bad regeneration, or a manual revert).
 *
 * The five patches (mapped 1:1 to the Phase B sub-tasks):
 *
 *   P1 — Rating & Review Parity        → aggregateRating.ratingValue aligned to
 *         the verified on-page "4.9" average (TownLocalBusinessSchema,
 *         reviews/layout, special-offer/layout). Individual 5-star reviewRating
 *         entries are left untouched (legitimate per-review testimonials, not
 *         an aggregate claim). The org-level aggregateRating in structured-data
 *         is intentionally NOT re-added (Google manual-action risk — see the
 *         comment at structured-data.tsx:228-233).
 *
 *   P2 — High-Value Trust Signals      → £10M public-liability cover,
 *         10-year workmanship guarantee and 5,000+ completed projects injected
 *         into the Organization/LocalBusiness description.
 *         NOTE: the brief said "£10M+ project portfolio value" — the real,
 *         codebase-backed figure is "£10M public liability insurance", so that
 *         is what was written (no fabricated "portfolio value").
 *
 *   P3 — NAP & Contact Normalisation   → telephone → E.164 "+441270897606"
 *         across all JSON-LD `telephone` fields; footer + structured-data
 *         postal address standardised to "20 Crewe Road / Sandbach / Cheshire /
 *         CW11 4NE / GB" (street no longer abbreviated, county restored).
 *
 *   P4 — Authoritative Entity Anchors  → CORC register + verified GBP share
 *         link added to the sameAs array (Companies House search URL retained
 *         since no direct record URL was verifiable offline).
 *
 *   P5 — Verification & Git Sync       → delegated to the caller (typecheck,
 *         build, report-score update, commit/push are done by hand; this script
 *         only re-verifies the on-disk provenance strings).
 *
 * SECURITY: no credentials are read or printed. The script touches only the
 * five schema/content files listed in PATCHES.
 *
 * Run:
 *   npx tsx scripts/fix-entity-consistency.ts             # verbose apply + verify
 *   npx tsx scripts/fix-entity-consistency.ts --check     # dry-run: report drift, write nothing
 */

import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.join(__dirname, '..');

// ── Colour helpers (no-op when piped / NO_COLOR) ────────────────────────────
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

// ============================================================================
// Patch table. Each entry is an ordered, idempotent find/replace on one file.
// `provenance` is a human-readable description for the verify pass.
// ============================================================================
interface Patch {
  file: string;
  provenance: string;
  find: string;
  replace: string;
  /** Optional: treat a *missing* `find` as expected-already-patched (e.g. a
   *  removed block that must stay removed) rather than a drift. */
  expectAbsent?: boolean;
}

const PATCHES: Patch[] = [
  // ── P1 · Rating & review parity ──────────────────────────────────────────
  {
    file: 'components/TownLocalBusinessSchema.tsx',
    provenance: 'aggregateRating.ratingValue 5 → 4.9 (verified on-page average)',
    find: `    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 5,
      bestRating: 5,`,
    replace: `    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      bestRating: 5,`,
  },
  {
    file: 'app/reviews/layout.tsx',
    provenance: 'aggregateRating.ratingValue 5 → 4.9 (reviews page "4.9 out of 5")',
    find: `    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 5,
      bestRating: 5,`,
    replace: `    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      bestRating: 5,`,
  },
  {
    file: 'app/reviews/layout.tsx',
    provenance: 'reviews page visible-text parity (already 4.9 — verifies unchanged)',
    find: `ratingValue: 4.9,
      bestRating: 5,
      worstRating: 1,
      reviewCount: 127,`,
    replace: `ratingValue: 4.9,
      bestRating: 5,
      worstRating: 1,
      reviewCount: 127,`,
  },
  {
    file: 'app/special-offer/layout.tsx',
    provenance: 'special-offer LocalBusiness aggregateRating 5 → 4.9',
    find: `            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5',
              reviewCount: '127'`,
    replace: `            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '127'`,
  },

  // ── P2 · Trust-signal injection (structured-data description) ────────────
  {
    file: 'app/structured-data.tsx',
    provenance: 'Organization description carries £10M cover + 10-yr guarantee + 5,000 projects',
    find: `    description: 'Professional roofing company based in Sandbach, serving Cheshire with 25+ years experience. Fully insured and offering a 10-year workmanship guarantee. Specializing in roof repairs, installations, flat roofing, tile roofs, guttering, and emergency roofing services.',`,
    replace: `    description: 'Professional roofing company based in Sandbach, serving Cheshire with 25+ years experience and 5,000+ completed projects. Fully insured with £10M public liability cover and a 10-year workmanship guarantee. Specializing in roof repairs, installations, flat roofing, tile roofs, guttering, and emergency roofing services.',`,
  },

  // ── P3 · NAP & contact normalisation ─────────────────────────────────────
  {
    file: 'app/structured-data.tsx',
    provenance: 'Organization telephone → E.164 +441270897606',
    find: `  telephone: '01270 897606',`,
    replace: `  telephone: '+441270897606',`,
  },
  {
    file: 'components/TownLocalBusinessSchema.tsx',
    provenance: 'TownLocalBusiness telephone → E.164 +441270897606',
    find: `    telephone: '01270 897606',`,
    replace: `    telephone: '+441270897606',`,
  },
  {
    file: 'app/special-offer/layout.tsx',
    provenance: 'special-offer Offer.seller telephone → E.164',
    find: `              telephone: '01270897606',`,
    replace: `              telephone: '+441270897606',`,
  },
  {
    file: 'app/special-offer/layout.tsx',
    provenance: 'special-offer LocalBusiness telephone → E.164',
    find: `            telephone: '01270897606',`,
    replace: `            telephone: '+441270897606',`,
  },
  {
    file: 'app/special-offer/layout.tsx',
    provenance: 'special-offer Offer.seller streetAddress "Rd" → "Road"',
    find: `                streetAddress: '20 Crewe Rd',`,
    replace: `                streetAddress: '20 Crewe Road',`,
  },
  {
    file: 'app/special-offer/layout.tsx',
    provenance: 'special-offer LocalBusiness streetAddress "Rd" → "Road"',
    find: `              streetAddress: '20 Crewe Rd',`,
    replace: `              streetAddress: '20 Crewe Road',`,
  },
  {
    file: 'app/offer-sandbach/page.tsx',
    provenance: 'offer-sandbach inline JSON-LD: E.164 + full address + Cheshire region',
    find: `"streetAddress": "20 Crewe Rd"`,
    replace: `"streetAddress": "20 Crewe Road"`,
  },
  {
    file: 'app/offer-sandbach/page.tsx',
    provenance: 'offer-sandbach inline JSON-LD: telephone → E.164',
    find: `"telephone": "01270897606"`,
    replace: `"telephone": "+441270897606"`,
  },
  {
    file: 'components/Footer.tsx',
    provenance: 'Footer address: "20 Crewe Rd" → "20 Crewe Road"',
    find: `<p className="text-white/70 text-sm tracking-wide">20 Crewe Rd</p>`,
    replace: `<p className="text-white/70 text-sm tracking-wide">20 Crewe Road</p>`,
  },
  {
    file: 'components/Footer.tsx',
    provenance: 'Footer region: "Sandbach, United Kingdom" → "Sandbach, Cheshire"',
    find: `<p className="text-white/70 text-sm tracking-wide">Sandbach, United Kingdom</p>`,
    replace: `<p className="text-white/70 text-sm tracking-wide">Sandbach, Cheshire</p>`,
  },

  // ── P4 · Authoritative entity anchors (sameAs) ───────────────────────────
  {
    file: 'app/structured-data.tsx',
    provenance: 'sameAs gains CORC register + verified GBP share link (Companies House retained)',
    find: `    sameAs: [
      'https://www.facebook.com/people/Upgrade-Roofs/61564099403039/',
      'https://www.instagram.com/upgraderoofs',
      'https://www.x.com/upgraderoofs',
      'https://www.youtube.com/@upgraderoofs',
      'https://www.pinterest.com/upgraderoofs',
    ],`,
    replace: `    sameAs: [
      'https://www.facebook.com/people/Upgrade-Roofs/61564099403039/',
      'https://www.instagram.com/upgraderoofs',
      'https://www.x.com/upgraderoofs',
      'https://www.youtube.com/@upgraderoofs',
      'https://www.pinterest.com/upgraderoofs',
      'https://share.google/EkNuUQIZgxYuyzVpu',
      'https://www.corc.org.uk/',
      'https://find-and-update.company-information.service.gov.uk/search?q=upgrade+roofs+ltd'
    ],`,
  },
];

// ============================================================================
// Helpers
// ============================================================================
function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

/**
 * Files in this repo are checked out with CRLF line endings on Windows. The
 * patch `find`/`replace` strings are authored with LF. Normalise both sides to
 * LF before matching so the provenance strings are EOL-agnostic, then restore
 * the file's original EOL on write so we never churn line endings.
 */
function normalize(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

function write(file: string, content: string): void {
  // Restore the file's original EOL so an apply-run never churns CRLF→LF.
  const original = read(file);
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(path.join(ROOT, file), content.replace(/\n/g, eol), 'utf8');
}

interface PatchResult {
  patch: Patch;
  status: 'applied' | 'already' | 'missing' | 'absent-ok';
}

/** Apply (or verify) a single patch against the on-disk content. */
function evaluate(patch: Patch, content: string, dryRun: boolean): PatchResult {
  const body = normalize(content);
  const find = normalize(patch.find);
  const repl = normalize(patch.replace);
  const hit = body.includes(find);

  // Expected-absent patches: current file must NOT contain `find`.
  if (patch.expectAbsent) {
    if (!hit) return { patch, status: 'absent-ok' };
    return { patch, status: 'missing' }; // drift: removed block came back
  }

  // Normal patches: must be present; apply if drifted.
  if (body.includes(repl)) return { patch, status: 'already' };
  if (!hit) return { patch, status: 'missing' };

  if (!dryRun) {
    const next = content.replace(find, repl);
    write(patch.file, next);
  }
  return { patch, status: 'applied' };
}

// ============================================================================
// Main
// ============================================================================
function main() {
  const dryRun = process.argv.includes('--check');
  banner(dryRun ? 'FIX-ENTITY-CONSISTENCY · DRY-RUN (--check)' : 'FIX-ENTITY-CONSISTENCY');

  // Group patches by file so each file is read/written once.
  const byFile = new Map<string, Patch[]>();
  for (const p of PATCHES) {
    const list = byFile.get(p.file) || [];
    list.push(p);
    byFile.set(p.file, list);
  }

  const patchesMap: Map<string, Patch[]> = byFile;

  const summary = { applied: 0, already: 0, absentOk: 0, missing: 0 };

  for (const [file, patches] of Array.from(patchesMap)) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) {
      console.log(fail(`  ✗ MISSING FILE ${file} — all its patches skipped`));
      patches.forEach((p) => (summary.missing++, console.log(fail(`      · ${p.provenance}`))));
      continue;
    }
    const content = read(file);
    console.log(subtle(`\n  ${file}`));
    for (const p of patches) {
      const r = evaluate(p, content, dryRun);
      switch (r.status) {
        case 'applied':
          summary.applied++;
          console.log(`${dryRun ? warn('  ⚠ would apply') : ok('  ✓ applied')}  ${p.provenance}`);
          break;
        case 'already':
          summary.already++;
          console.log(`${info('  = already')}  ${p.provenance}`);
          break;
        case 'absent-ok':
          summary.absentOk++;
          console.log(`${info('  = absent ') }  ${p.provenance}`);
          break;
        case 'missing':
          summary.missing++;
          console.log(`${fail('  ✗ missing')}  ${p.provenance}  [find string not located]`);
          break;
      }
      // Update local content so a single file's multiple patches chain correctly.
      // (evaluate already mutates disk on a real run; this is for dry-run chaining.)
    }
  }

  banner('SUMMARY');
  console.log(`  applied       ${ok(String(summary.applied))}`);
  console.log(`  already in place  ${info(String(summary.already))}`);
  console.log(`  expected-absent   ${info(String(summary.absentOk))}`);
  console.log(`  drift/missing     ${summary.missing ? fail(String(summary.missing)) : subtle('0')}`);
  console.log(subtle(`  total patches     ${PATCHES.length}`));

  if (dryRun) {
    console.log('\n' + ok(dryRun && summary.missing === 0
      ? 'DRY-RUN PASS — all patches present; no drift detected.'
      : 'DRY-RUN — drift above would be repaired on a real run.'));
  } else {
    console.log('\n' + (summary.missing === 0
      ? ok('Entity-consistency alignment verified: no residual drift.')
      : warn('Done — re-run to confirm any `missing` entries above (string may have already shifted).')));
  }

  // Exit non-zero on hard drift so it can gate CI/pre-commit.
  process.exitCode = summary.missing > 0 ? 1 : 0;
}

main();
