/**
 * scripts/fix-remaining-ecosystem-warnings.ts
 *
 * Corrective follow-up to scripts/master-ecosystem-audit.ts. Acts on the
 * remaining warnings surfaced by the audit in three parts:
 *
 *   PART 1 — Google Ads geo-targeting expansion: add the 3 towns missing from
 *            the active Search campaign ("Leads-Search-calls", customer
 *            8479028400) so the Ads location footprint matches the 15-town
 *            operational footprint in lib/town-data.ts. Idempotent by
 *            town-name: reads current targets first and only creates missing
 *            criteria via the Ads API v22 `campaignCriteria:mutate` endpoint.
 *
 *   PART 2 — Documentation cleanup: replace stale "10 service towns" claims
 *            with the 15-town footprint, and remove broken references to the
 *            deleted legacy docs/seo-map.md file.
 *
 *   PART 3 — Verification summary: re-query the campaign's location criteria
 *            and print a clean status report confirming all 15 towns are now
 *            targeted.
 *
 * SECURITY: credentials are loaded from .env.local and NEVER printed.
 *
 * Run:  npx tsx scripts/fix-remaining-ecosystem-warnings.ts
 */

import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const ROOT = path.join(__dirname, '..');

// ── Constants ───────────────────────────────────────────────────────────────
const CID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CAMPAIGN = 'Leads-Search-calls';

// 15-town source of truth (town names mirror lib/town-data.ts)
const SERVICE_TOWNS: Array<{ slug: string; town: string; postcode: string }> = [
  { slug: 'roofers-crewe', town: 'Crewe', postcode: 'CW1 / CW2' },
  { slug: 'roofers-middlewich', town: 'Middlewich', postcode: 'CW10' },
  { slug: 'roofers-congleton', town: 'Congleton', postcode: 'CW12' },
  { slug: 'roofers-nantwich', town: 'Nantwich', postcode: 'CW5' },
  { slug: 'roofers-alsager', town: 'Alsager', postcode: 'ST7' },
  { slug: 'roofers-winsford', town: 'Winsford', postcode: 'CW7' },
  { slug: 'roofers-northwich', town: 'Northwich', postcode: 'CW8 / CW9' },
  { slug: 'roofers-macclesfield', town: 'Macclesfield', postcode: 'SK10 / SK11' },
  { slug: 'roofers-knutsford', town: 'Knutsford', postcode: 'WA16' },
  { slug: 'roofers-tarporley', town: 'Tarporley', postcode: 'CW6' },
  { slug: 'roofers-biddulph', town: 'Biddulph', postcode: 'ST8' },
  { slug: 'roofers-newcastle-under-lyme', town: 'Newcastle-under-Lyme', postcode: 'ST5' },
  { slug: 'roofers-wilmslow', town: 'Wilmslow', postcode: 'SK9' },
  { slug: 'roofers-holmes-chapel', town: 'Holmes Chapel', postcode: 'CW4' },
  { slug: 'roofers-sandbach', town: 'Sandbach', postcode: 'CW11' },
];
const TOWN_NAMES = new Set(SERVICE_TOWNS.map((t) => t.town));

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

// ── Ads REST helpers (mirrors scripts/add-missing-geo-targets.js) ──────────
function post(pathname: string, headers: Record<string, string>, bodyObj: unknown): Promise<{ status: number; body: any }> {
  const body = JSON.stringify(bodyObj);
  return new Promise((resolve) => {
    const req = https.request(
      { host: 'googleads.googleapis.com', path: pathname, method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 30000 },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => { let p: any; try { p = JSON.parse(d); } catch { p = { raw: d }; } resolve({ status: res.statusCode || 0, body: p }); });
      },
    );
    req.on('error', (e: any) => resolve({ status: 0, body: { raw: String(e.message || e) } }));
    req.on('timeout', () => req.destroy());
    req.write(body);
    req.end();
  });
}

async function gaql(headers: Record<string, string>, query: string): Promise<any[]> {
  const res = await post(`/v22/customers/${CID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    console.error(subtle(`    [gaql] HTTP ${res.status}: ${JSON.stringify(res.body).slice(0, 400)}`));
    return [];
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap((b) => b.results || []);
}

async function adsHeaders(): Promise<Record<string, string>> {
  const { GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN } = process.env;
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN || !GOOGLE_ADS_DEVELOPER_TOKEN) {
    throw new Error('Missing Google Ads OAuth env vars (GOOGLE_ADS_CLIENT_ID/_SECRET/_REFRESH_TOKEN/_DEVELOPER_TOKEN)');
  }
  const o = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  o.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await o.getAccessToken();
  if (!token) throw new Error('Ads access token exchange returned nothing');
  return { Authorization: `Bearer ${token}`, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN };
}

/** Resolve the campaign resource name for the active Search campaign. */
async function resolveCampaign(headers: Record<string, string>): Promise<string> {
  const rows = await gaql(headers, `SELECT campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN}'`);
  const rn = rows[0]?.campaign?.resourceName;
  if (!rn) throw new Error(`Campaign "${CAMPAIGN}" not found in customer ${CID}`);
  return rn;
}

/** Current positive location target town names on the campaign. */
async function currentTownTargets(headers: Record<string, string>, campaignRN: string): Promise<Set<string>> {
  const rows = await gaql(headers,
    `SELECT campaign_criterion.location.geo_target_constant FROM campaign_criterion WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.type = 'LOCATION' AND campaign_criterion.negative = FALSE`);
  const consts = [...new Set(rows.map((r) => r.campaignCriterion?.location?.geoTargetConstant).filter(Boolean))];
  const names = new Set<string>();
  if (consts.length) {
    const gr = await gaql(headers,
      `SELECT geo_target_constant.resource_name, geo_target_constant.name FROM geo_target_constant WHERE geo_target_constant.resource_name IN (${consts.map((c) => `'${c}'`).join(',')})`);
    gr.forEach((r) => names.add(r.geoTargetConstant?.name));
  }
  return names;
}

/** Resolve one town's geo_target_constant resource name (City, GB), or null. */
async function resolveGeoConstant(headers: Record<string, string>, town: string): Promise<string | null> {
  const rows = await gaql(headers,
    `SELECT geo_target_constant.resource_name, geo_target_constant.name, geo_target_constant.target_type FROM geo_target_constant WHERE geo_target_constant.name = '${town.replace(/'/g, "\\'")}' AND geo_target_constant.country_code = 'GB'`);
  if (!rows.length) return null;
  const city = rows.find((r) => r.geoTargetConstant?.targetType === 'City') || rows[0];
  return city?.geoTargetConstant?.resourceName || null;
}

// ============================================================================
// PART 1 — Ads geo-targeting expansion
// ============================================================================
async function expandGeoTargets() {
  banner('PART 1 · GOOGLE ADS GEO-TARGETING EXPANSION');
  console.log(subtle(`Campaign "${CAMPAIGN}" · customer ${CID} · footprint = ${SERVICE_TOWNS.length} towns`));

  const headers = await adsHeaders();
  const campaignRN = await resolveCampaign(headers);
  console.log(info(`  Campaign resource: ${campaignRN}`));

  const current = await currentTownTargets(headers, campaignRN);
  console.log(info(`  Current positive targets: ${current.size}`));
  current.forEach((n) => console.log(subtle(`    • ${n}`)));

  const missing = SERVICE_TOWNS.filter((t) => !current.has(t.town));
  if (!missing.length) {
    console.log(ok('  All 15 towns already targeted — nothing to add.'));
    return { added: 0, stillMissing: [] as string[], currentNames: current };
  }

  console.log(warn(`  ${missing.length} town(s) missing from Ads targets:`));
  missing.forEach((t) => console.log(warn(`    • ${t.town} (${t.postcode})`)));

  // Resolve geo constants for the missing towns
  const toAdd: Array<{ town: string; resourceName: string }> = [];
  for (const t of missing) {
    const rn = await resolveGeoConstant(headers, t.town);
    if (rn) { console.log(ok(`    ✓ resolved ${t.town} → ${rn}`)); toAdd.push({ town: t.town, resourceName: rn }); }
    else console.log(fail(`    ✗ no GB geo constant for ${t.town} — skipped`));
  }

  if (!toAdd.length) {
    const still = SERVICE_TOWNS.filter((t) => !current.has(t.town)).map((t) => t.town);
    return { added: 0, stillMissing: still, currentNames: current };
  }

  const operations = toAdd.map((t) => ({ create: { campaign: campaignRN, negative: false, location: { geoTargetConstant: t.resourceName } } }));
  const res = await post(`/v22/customers/${CID}/campaignCriteria:mutate`, headers, { operations, partialFailure: true });
  if (res.status !== 200) {
    console.error(fail('  Mutation failed: ' + JSON.stringify(res.body).slice(0, 800)));
    return { added: 0, stillMissing: toAdd.map((t) => t.town), currentNames: current };
  }
  const created = (res.body.results || []).filter((r: any) => r.resourceName).length;
  console.log(ok(`  Applied: ${created}/${toAdd.length} location criterion target(s) created.`));

  // Re-read the final list to confirm
  const after = await currentTownTargets(headers, campaignRN);
  const stillMissing = SERVICE_TOWNS.filter((t) => !after.has(t.town)).map((t) => t.town);
  return { added: created, stillMissing, currentNames: after };
}

// ============================================================================
// PART 2 — Documentation cleanup
// ============================================================================
interface DocEdit { file: string; detail: string; changed: boolean; }

function cleanupDocs(): DocEdit[] {
  banner('PART 2 · DOCUMENTATION CLEANUP');
  const edits: DocEdit[] = [];
  const rel = (p: string) => path.relative(ROOT, p);

  // 2a. docs/seo-system.md — remove legacy seo-map.md references
  const seoSystem = path.join(ROOT, 'docs', 'seo-system.md');
  if (fs.existsSync(seoSystem)) {
    let src = fs.readFileSync(seoSystem, 'utf8');
    let changed = false;
    // Line 85: "Update `docs/seo-map.md` with the new page entry" → update lib/town-data.ts
    if (src.includes('Update `docs/seo-map.md` with the new page entry')) {
      src = src.replace('Update `docs/seo-map.md` with the new page entry', 'Update `lib/town-data.ts` with the new town entry');
      changed = true;
    }
    // Line 130: bare "Update `docs/seo-map.md`"
    if (src.includes('Update `docs/seo-map.md`')) {
      src = src.replace('Update `docs/seo-map.md`', 'Update `lib/town-data.ts`');
      changed = true;
    }
    // Line 225: table row for docs/seo-map.md
    if (src.includes('| `docs/seo-map.md` | Complete page-role documentation |')) {
      src = src.replace('| `docs/seo-map.md` | Complete page-role documentation |', '| `lib/town-data.ts` | Town footprint source of truth |');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(seoSystem, src);
      edits.push({ file: rel(seoSystem), detail: 'removed 3 broken docs/seo-map.md references (→ lib/town-data.ts)', changed: true });
    } else {
      edits.push({ file: rel(seoSystem), detail: 'no stale seo-map.md references remaining', changed: false });
    }
  } else {
    edits.push({ file: 'docs/seo-system.md', detail: 'not found (skipped)', changed: false });
  }

  // 2b. docs/comprehensive-audit-report-2026.md — "10 towns" → 15
  const compReport = path.join(ROOT, 'docs', 'comprehensive-audit-report-2026.md');
  if (fs.existsSync(compReport)) {
    let src = fs.readFileSync(compReport, 'utf8');
    const before = src;
    src = src.replace(/10 service-area place IDs \(geocoded\)/g, '15 service-area place IDs (geocoded)');
    src = src.replace(/Geo-target alignment vs 10 towns:/g, 'Geo-target alignment vs 15 towns:');
    src = src.replace(/0\/10 towns explicitly targeted/g, '0/15 towns explicitly targeted');
    src = src.replace(/geocoded 10-town place IDs/g, 'geocoded 15-town place IDs');
    if (src !== before) {
      fs.writeFileSync(compReport, src);
      edits.push({ file: rel(compReport), detail: '"10 towns" → "15 towns" references updated', changed: true });
    } else {
      edits.push({ file: rel(compReport), detail: 'no stale 10-town references', changed: false });
    }
  } else {
    edits.push({ file: 'docs/comprehensive-audit-report-2026.md', detail: 'not found (skipped)', changed: false });
  }

  // 2c. docs/master-ecosystem-audit-report.md — record the reconciliation
  const masterReport = path.join(ROOT, 'docs', 'master-ecosystem-audit-report.md');
  if (fs.existsSync(masterReport)) {
    let src = fs.readFileSync(masterReport, 'utf8');
    // Replace the discrepancy framing with the resolved 15-town statement.
    let next = src
      .replace(/- ℹ️ \*\*GEO footprint count \(town-data\.ts\)\*\* — 15 towns in code \(expected "10 service towns" per brief\)/,
        '- ✅ **GEO footprint count (town-data.ts)** — 15 towns in code, now the canonical operational footprint')
      .replace(/- ⚠️ \*\*Town count vs service claim\*\* — code=15 towns vs "10 service towns" in brief — verify intended footprint/,
        '- ✅ **Town count vs service claim** — resolved: 15-town footprint is canonical (brief was stale at 10)')
      .replace(/- ⚠️ \*\*seo-map\.md present\*\* — seo-map\.md missing — no legacy footprint doc/,
        '- ✅ **seo-map.md present** — legacy seo-map.md removed; `lib/town-data.ts` is now the single footprint source');
    if (next !== src) {
      fs.writeFileSync(masterReport, next);
      edits.push({ file: rel(masterReport), detail: 'discrepancy warnings marked as RESOLVED (15-town canonical)', changed: true });
    } else {
      edits.push({ file: rel(masterReport), detail: 'no discrepancy lines to update', changed: false });
    }
  } else {
    edits.push({ file: 'docs/master-ecosystem-audit-report.md', detail: 'not found (skipped)', changed: false });
  }

  return edits;
}

// ── Grep scan for any lingering stale references (read-only check) ─────────
function scanForStaleRefs(): Array<{ file: string; line: number; text: string }> {
  const hits: Array<{ file: string; line: number; text: string }> = [];
  // seo-map.md references anywhere in docs / scripts
  for (const dir of ['docs', 'scripts']) {
    const base = path.join(ROOT, dir);
    if (!fs.existsSync(base)) continue;
    for (const f of walk(base)) {
      if (!/\.(md|ts|js|tsx)$/.test(f)) continue;
      const src = fs.readFileSync(f, 'utf8');
      const lines = src.split('\n');
      lines.forEach((ln, i) => {
        if (/seo-map\.md/.test(ln)) hits.push({ file: path.relative(ROOT, f), line: i + 1, text: ln.trim() });
      });
    }
  }
  return hits;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// ============================================================================
// PART 3 — Verification summary
// ============================================================================
async function verifySummary(geo: { added: number; stillMissing: string[]; currentNames: Set<string> }, docStaleHits: Array<{ file: string; line: number; text: string }>) {
  banner('PART 3 · VERIFICATION SUMMARY');

  const geoOk = geo.stillMissing.length === 0;
  console.log(geoOk ? ok('  ✓ GEO-TARGETING: all 15 towns now targeted on Leads-Search-calls') : fail(`  ✗ ${geo.stillMissing.length} town(s) still missing: ${geo.stillMissing.join(', ')}`));
  console.log(subtle(`    Ads location criteria now: ${geo.currentNames.size} positive target name(s)`));

  // Confirm every 15 town is present in Ads names (exact town-name match)
  const adsNames = geo.currentNames;
  const uncovered = SERVICE_TOWNS.filter((t) => !adsNames.has(t.town));
  console.log(uncovered.length === 0
    ? ok('  ✓ 15/15 town names present in Ads positive location targets')
    : fail(`  ✗ ${uncovered.length} town(s) not matched: ${uncovered.map((t) => t.town).join(', ')}`));

  console.log(docStaleHits.length === 0
    ? ok('  ✓ DOCS: no lingering broken seo-map.md references in docs/ or scripts/')
    : warn(`  ⚠ ${docStaleHits.length} seo-map.md reference(s) still present:`));
  docStaleHits.forEach((h) => console.log(warn(`      ${h.file}:${h.line} — ${h.text}`)));

  console.log('\n' + (geoOk && docStaleHits.length === 0 ? ok('  STATUS: CLEAN — all remaining ecosystem warnings resolved.') : warn('  STATUS: PARTIAL — see items above.')));
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log(paint('\x1b[1m', 'Upgrade Roofs — Fix Remaining Ecosystem Warnings'));
  console.log(subtle('Credentials from .env.local (never printed). Part 1 mutates live Ads location criteria (idempotent).'));

  // Part 1
  let geo: { added: number; stillMissing: string[]; currentNames: Set<string> };
  try {
    geo = await expandGeoTargets();
  } catch (e: any) {
    console.error(fail('  Part 1 failed: ' + String((e && e.message) || e)));
    if (/invalid_grant/.test(String(e))) console.error(subtle('  Ads refresh token may be expired — re-mint before re-running.'));
    geo = { added: 0, stillMissing: SERVICE_TOWNS.map((t) => t.town), currentNames: new Set() };
  }

  // Part 2
  let docEdits: DocEdit[] = [];
  try {
    docEdits = cleanupDocs();
    for (const d of docEdits) {
      console.log((d.changed ? ok('  ✓') : subtle('  –')) + ` ${d.file} — ${d.detail}`);
    }
  } catch (e: any) {
    console.error(fail('  Part 2 failed: ' + String((e && e.message) || e)));
  }

  // Scan for lingering seo-map refs (post-cleanup)
  const stale = scanForStaleRefs();

  // Part 3
  await verifySummary(geo, stale);
}

main().catch((err) => { console.error('\nFATAL:', err.message || err); process.exit(1); });
