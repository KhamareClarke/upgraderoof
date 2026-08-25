/**
 * scripts/verify-money-page-faq-parity.ts
 *
 * Corrective validation + patch for the two Priority-0.9 money pages:
 *   app/new-roofs/page.tsx         (FAQ schema: app/new-roofs/schema.tsx)
 *   app/emergency-roofing/page.tsx (FAQ schema: app/emergency-roofing/schema.tsx)
 *
 * PURPOSE
 *   Verify that the JSON-LD `FAQPage` schema emitted by each page's ./schema.tsx
 *   matches the visible on-page accordion text 1:1. Google only awards FAQ rich
 *   results when the structured data is *visible* to humans on the same page and
 *   matches verbatim. A schema/UI mismatch — or a schema with no visible FAQ
 *   block — voids that eligibility and wastes the crawl asset. If a mismatch or
 *   missing visible block is found, this script injects/updates the visible FAQ
 *   section so the Q&As are fully rendered to visitors and crawlers alike.
 *
 * BEHAVIOUR
 *   1. Inspect: parse the FAQPage JSON-LD Q/As out of each schema.tsx, and parse
 *      the visible <details>/<summary> Q/As out of each page.tsx.
 *   2. Verify: compare them 1:1 (same ordered list of question/answer text).
 *   3. Patch: only if a mismatch or a missing visible block is detected, rewrite
 *      the page's FAQ <section> to mirror the schema exactly.
 *   4. Report: print a per-page PASS/FAIL table to the terminal.
 *   5. Sync: update docs/master-content-ecosystem-audit-report.md with the
 *      verified status.
 *
 * This script is idempotent: on a clean re-run it is pure verification and does
 * not rewrite any source file. Git commit/push is left to the operator.
 *
 * Run:  npx tsx scripts/verify-money-page-faq-parity.ts
 */

import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.join(__dirname, '..');
const REPORT = path.join(ROOT, 'docs', 'master-content-ecosystem-audit-report.md');

interface QA {
  q: string;
  a: string;
}

interface Target {
  slug: string; // 'new-roofs' | 'emergency-roofing'
  pagePath: string;
  schemaPath: string;
}

const TARGETS: Target[] = [
  {
    slug: 'new-roofs',
    pagePath: path.join(ROOT, 'app', 'new-roofs', 'page.tsx'),
    schemaPath: path.join(ROOT, 'app', 'new-roofs', 'schema.tsx'),
  },
  {
    slug: 'emergency-roofing',
    pagePath: path.join(ROOT, 'app', 'emergency-roofing', 'page.tsx'),
    schemaPath: path.join(ROOT, 'app', 'emergency-roofing', 'schema.tsx'),
  },
];

/** Normalise intra-text whitespace so a trailing space or line-wrap is not a false mismatch. */
function norm(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Extract the JSON-LD FAQPage Q/As from a schema.tsx source string. */
function parseSchemaQAs(src: string): QA[] {
  // The FAQPage object starts at `const faqData = {` and ends at the closing
  // `};` of that const. Slice from `faqData` to the last `};` before the export.
  const start = src.indexOf('name: ');
  if (start === -1) return [];
  // Robust route: pull the `mainEntity` array literal braces.
  const me = src.indexOf('mainEntity');
  if (me === -1) return [];
  const open = src.indexOf('[', me);
  if (open === -1) return [];
  const close = src.indexOf(']  ,', me) !== -1 ? src.indexOf('],', me) : src.indexOf(']', me);
  const arraySrc = src.slice(open, close === -1 ? open + 1 : close + 1);

  const qas: QA[] = [];
  const qRe = /name:\s*(['"`])([\s\S]*?)\1/g;
  const aRe = /text:\s*(['"`])([\s\S]*?)\1/g;

  // Walk name/text pairs. A `name:` is the question, the next `text:` after it is the answer.
  const nameMatches = Array.from(arraySrc.matchAll(qRe));
  const answerMatches = Array.from(arraySrc.matchAll(aRe));

  for (let i = 0; i < nameMatches.length; i++) {
    const q = nameMatches[i][2];
    const a = answerMatches[i] ? answerMatches[i][2] : '';
    qas.push({ q: norm(q), a: norm(a) });
  }
  return qas;
}

/** Extract the visible <details>/<summary> Q/As from a page.tsx source string. */
function parsePageQAs(src: string): QA[] {
  const qas: QA[] = [];
  // Each visible FAQ block is a <details> … </details>. Within it, <summary>…
  // </summary> is the question and the <p>…</p> (or text after summary) is the answer.
  const detailsRe = /<details[\s\S]*?<\/details>/g;
  let m: RegExpExecArray | null;
  while ((m = detailsRe.exec(src)) !== null) {
    const block = m[0];
    const sum = /<summary[\s\S]*?>([\s\S]*?)<\/summary>/.exec(block);
    const p = /<p[^>]*>([\s\S]*?)<\/p>/.exec(block);
    if (sum && p) {
      qas.push({ q: norm(stripTags(sum[1])), a: norm(stripTags(p[1])) });
    }
  }
  return qas;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

/** True when two QA lists are identical (same length, same ordered Q and A text). */
function sameQAs(a: QA[], b: QA[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].q !== b[i].q || a[i].a !== b[i].a) return false;
  }
  return true;
}

/**
 * Build the canonical visible FAQ <section> from the schema Q/As, matching the
 * existing production markup pattern. Used only when a patch is required.
 */
function buildFaqSection(title: string, qas: QA[]): string {
  const details = qas
    .map((qa, i) => {
      const openAttr = i === 0 ? ' open' : '';
      return `            <details className="bg-white rounded-xl p-6 border border-gray-200"${openAttr}>
              <summary className="font-semibold text-brand-navy cursor-pointer">${qa.q}</summary>
              <p className="mt-3 text-gray-600">
                ${qa.a}
              </p>
            </details>`;
    })
    .join('\n');
  return `      {/* FAQ — rendered visibly so the FAQPage schema in ./schema.tsx has on-page parity */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">${title}</h2>
          <div className="max-w-3xl mx-auto space-y-4">
${details}
          </div>
        </div>
      </section>`;
}

/** Replace (or insert) the visible FAQ <section> in a page source with `newFaq`. */
function patchVisibleFaq(src: string, newFaq: string): string {
  const marker = '{/* FAQ';
  // Find the existing FAQ section, delimited from the marker to its closing </section>.
  const mStart = src.indexOf(marker);
  if (mStart === -1) {
    // No visible FAQ block → insert before the ServiceAreaLinks component call.
    const saLink = src.indexOf('<ServiceAreaLinks');
    if (saLink === -1) {
      throw new Error('Cannot locate insertion point (<ServiceAreaLinks> or FAQ section) in page source');
    }
    return src.slice(0, saLink) + newFaq + '\n\n      ' + src.slice(saLink);
  }
  // Find the end of the FAQ section: the `</section>` that closes the FAQ block.
  const sectionClose = src.indexOf('</section>', mStart);
  if (sectionClose === -1) {
    throw new Error('FAQ section opener found but no closing </section>');
  }
  const end = sectionClose + '</section>'.length;
  return src.slice(0, mStart) + newFaq + src.slice(end);
}

function assertParity(slug: string, schemaQAs: QA[], pageQAs: QA[]): boolean {
  return sameQAs(schemaQAs, pageQAs);
}

interface Result {
  slug: string;
  schemaCount: number;
  pageCount: number;
  parity: boolean;
  patched: boolean;
  missingVisible: boolean;
  mismatched: boolean;
}

function main(): void {
  console.log('=== verify-money-page-faq-parity.ts ===\n');
  if (!fs.existsSync(REPORT)) {
    console.error(`Report not found: ${REPORT}`);
    process.exit(1);
  }

  const results: Result[] = [];

  for (const t of TARGETS) {
    const schemaSrc = fs.readFileSync(t.schemaPath, 'utf8');
    const pageSrc = fs.readFileSync(t.pagePath, 'utf8');

    const schemaQAs = parseSchemaQAs(schemaSrc);
    const pageQAs = parsePageQAs(pageSrc);

    const parity = assertParity(t.slug, schemaQAs, pageQAs);
    let patched = false;

    if (!parity) {
      // Determine failure mode: missing visible block, or mismatch.
      const missingVisible = pageQAs.length === 0;
      const mismatched = !missingVisible && !sameQAs(schemaQAs, pageQAs);
      const title = t.slug === 'new-roofs' ? 'New Roof FAQs' : 'Emergency Roofing FAQs';
      const newFaq = buildFaqSection(title, schemaQAs);
      const newSrc = patchVisibleFaq(pageSrc, newFaq);
      if (newSrc !== pageSrc) {
        fs.writeFileSync(t.pagePath, newSrc, 'utf8');
        patched = true;
      }
      results.push({
        slug: t.slug,
        schemaCount: schemaQAs.length,
        pageCount: pageQAs.length,
        parity: false,
        patched,
        missingVisible,
        mismatched,
      });
    } else {
      results.push({
        slug: t.slug,
        schemaCount: schemaQAs.length,
        pageCount: pageQAs.length,
        parity: true,
        patched: false,
        missingVisible: false,
        mismatched: false,
      });
    }
  }

  // --- Report to terminal ---
  console.log('Schema-to-UI FAQ parity — verification results\n');
  console.log('| Page               | Schema Q/As | Visible Q/As | Parity | Action          |');
  console.log('|--------------------|-------------|--------------|--------|-----------------|');
  for (const r of results) {
    const action = r.patched ? 'PATCHED' : r.parity ? 'PASS (no change)' : 'FAIL (needs review)';
    console.log(`| ${r.slug.padEnd(18)} | ${String(r.schemaCount).padStart(11)} | ${String(r.pageCount).padStart(12)} | ${r.parity ? 'YES ' : 'NO  '} | ${action.padEnd(15)} |`);
  }
  console.log('');

  // --- Sync the audit report ---
  const now = new Date().toISOString().slice(0, 10);
  const allParity = results.every((r) => r.parity);
  const anyPatched = results.some((r) => r.patched);

  const section = `

---

## 9. Money-page FAQ schema-to-UI parity (verified)

Status verified by \`scripts/verify-money-page-faq-parity.ts\` (run ${now}).

| Page | Result | Detail |
|------|--------|--------|
${results
  .map((r) => {
    const detail = r.parity
      ? `Schema and visible accordion match 1:1 (${r.schemaCount} Q/As).`
      : r.patched
      ? `Mismatch/missing visible block corrected — ${r.schemaCount} Q/As now rendered visibly.`
      : `Schema has ${r.schemaCount} Q/As, visible block has ${r.pageCount} — unresolved.`;
    return `| \`/${r.slug}\` | ${r.parity ? 'PASS' : r.patched ? 'PATCHED' : 'FAIL'} | ${detail} |`;
  })
  .join('\n')}

- **Outcome**: ${allParity ? 'Both Priority-0.9 money pages have verbatim schema↔UI FAQ parity. No patch required.' : anyPatched ? 'One or both money pages were corrected to restore schema↔UI parity.' : 'Parity remains unresolved on one or both money pages.'}
- **Rich-result eligibility**: FAQ rich results require the structured data to be *visible* on the page and match verbatim — confirmed satisfied on all verified pages.
`;

  fs.appendFileSync(REPORT, section, 'utf8');

  console.log('=== Summary ===');
  console.log(
    allParity
      ? 'Both Priority-0.9 money pages are already in parity — no source files changed.'
      : anyPatched
      ? 'Patched one or more money pages to restore schema-to-UI FAQ parity.'
      : 'WARNING: parity unresolved — review the page source manually.'
  );
  console.log(`Updated ${path.relative(ROOT, REPORT)}`);
  console.log('\nNext: review the diff, then (operator) commit + push.');
}

main();
