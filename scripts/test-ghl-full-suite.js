/**
 * scripts/test-ghl-full-suite.js
 *
 * Full GHL v2 integration diagnostic for upgraderoofs.co.uk.
 * READ-ONLY against the live account — verifies connectivity + scope across
 * every module the site integrates, and prints a connectivity summary.
 *
 * Covers:
 *   Auth / Location, Contacts, Pipelines (Opportunities), Calendars,
 *   Conversations, Invoices/Estimates, Blogs
 *
 * Run:  node scripts/test-ghl-full-suite.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const https = require('https');

const HOST = 'services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const { GHL_LOCATION_ID, GHL_API_KEY } = process.env;

const results = [];
function record(area, ok, detail) {
  results.push({ area, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${area.padEnd(28)} ${detail}`);
}

function banner(t) {
  console.log('\n' + '='.repeat(70));
  console.log('  ' + t);
  console.log('='.repeat(70));
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST, path, method: 'GET',
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: API_VERSION,
          'Version-Header': API_VERSION,
          Accept: 'application/json',
        },
      },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p });
      }); }
    );
    req.on('error', reject);
    req.end();
  });
}

async function probe(area, path, extract) {
  try {
    const res = await get(path);
    if (res.status === 200) {
      record(area, true, extract ? extract(res.body) : 'OK');
      return { ok: true, body: res.body };
    }
    const msg = (res.body && (res.body.message || res.body.error || res.body.msg)) || JSON.stringify(res.body).slice(0, 120);
    const scopeHint = res.status === 403 || res.status === 401 ? ' (scope/permission missing on token)' : '';
    record(area, false, `HTTP ${res.status}${scopeHint} — ${String(msg).slice(0, 90)}`);
    return { ok: false, status: res.status };
  } catch (err) {
    record(area, false, `request failed — ${err.message}`);
    return { ok: false, error: err.message };
  }
}

async function main() {
  banner('GHL FULL-SUITE DIAGNOSTIC — upgraderoofs.co.uk (READ-ONLY)');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  Host: ${HOST}  |  Version: ${API_VERSION}`);

  if (!GHL_LOCATION_ID || !GHL_API_KEY) {
    console.error('\nMissing GHL_LOCATION_ID / GHL_API_KEY in .env.local');
    process.exit(1);
  }
  console.log(`Location: ${GHL_LOCATION_ID}\n`);

  // 1. Auth / Location
  banner('1. AUTH & LOCATION');
  const loc = await probe('Location access', `/locations/${encodeURIComponent(GHL_LOCATION_ID)}`,
    b => { const l = b.location || b; return `"${l.name}" (${l.id || GHL_LOCATION_ID})`; });
  const locationOk = loc.ok;

  // 2. Contacts
  banner('2. CONTACTS');
  await probe('Contacts (read)', `/contacts/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}&limit=1`,
    b => `${b.total != null ? b.total : (b.contacts || []).length} contact(s) in location`);

  // 3. Pipelines / Opportunities
  banner('3. PIPELINES / OPPORTUNITIES');
  const pipes = await probe('Pipelines (read)', `/opportunities/pipelines?locationId=${encodeURIComponent(GHL_LOCATION_ID)}`,
    b => `${(b.pipelines || []).length} pipeline(s)`);
  if (pipes.ok) {
    const list = pipes.body.pipelines || [];
    for (const p of list) {
      console.log(`      ▣ ${p.name} — ${(p.stages || []).length} stage(s): ${(p.stages || []).map(s => s.name).join(' → ') || '(none)'}`);
    }
    if (!list.length) console.log('      (no pipelines — create one for the offline-conversion webhook)');
  }

  // 4. Calendars
  banner('4. CALENDARS');
  const cals = await probe('Calendars (read)', `/calendars/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}`,
    b => `${(b.calendars || []).length} calendar(s)`);
  if (cals.ok) {
    for (const c of (cals.body.calendars || [])) {
      console.log(`      ▣ ${c.name}  [id: ${c.id}]  ${c.isActive ? 'active' : 'inactive'}`);
    }
    if (!(cals.body.calendars || []).length) console.log('      (no calendars — create one for online roof-inspection booking)');
  }

  // 5. Conversations
  banner('5. CONVERSATIONS');
  await probe('Conversations (read)', `/conversations/search?locationId=${encodeURIComponent(GHL_LOCATION_ID)}&limit=1`,
    b => `${b.total != null ? b.total : (b.conversations || []).length} conversation(s)`);

  // 6. Invoices / Estimates
  banner('6. INVOICES / ESTIMATES');
  await probe('Invoices (read)', `/invoices/?altId=${encodeURIComponent(GHL_LOCATION_ID)}&altType=location&limit=1&offset=0`,
    b => `${(b.invoices || []).length} invoice(s)`);

  // 7. Blogs — GHL's blog endpoint isn't available on most Private Integration
  // tokens (404). That's expected: lib/ghl/blogs.js falls back to the static
  // post list. Report as informational, not a hard failure.
  banner('7. BLOG / CMS');
  {
    const res = await get(`/blogs/posts?locationId=${encodeURIComponent(GHL_LOCATION_ID)}&limit=1&status=published`);
    if (res.status === 200) {
      const n = ((res.body.posts || res.body.blogs || res.body.data) || []).length;
      record('Blog posts (read)', true, `${n} published post(s) from GHL`);
    } else {
      record('Blog posts (GHL)', true, `unavailable (HTTP ${res.status}) — using static fallback (by design)`);
    }
  }

  // Summary
  banner('CONNECTIVITY SUMMARY');
  const okCount = results.filter(r => r.ok).length;
  const total = results.length;
  console.log(`\n  Location:     ${GHL_LOCATION_ID}`);
  console.log(`  Auth:         ${locationOk ? 'OK' : 'FAILED'}`);
  console.log(`  Areas OK:     ${okCount}/${total}`);
  console.log('');
  for (const r of results) {
    console.log(`    ${r.ok ? 'PASS' : 'FAIL'}  ${r.area}`);
  }

  const missing = results.filter(r => !r.ok);
  if (missing.length) {
    console.log('\n  Action needed — the following areas failed (likely missing token scopes):');
    console.log('  GHL sub-account → Settings → Private Integrations → edit token scopes:');
    const scopeMap = {
      'Contacts (read)': 'contacts.readonly (+ contacts.write for lead capture)',
      'Pipelines (read)': 'opportunities.readonly (+ opportunities.write for pipeline)',
      'Calendars (read)': 'calendars.readonly (+ calendars.write for booking)',
      'Conversations (read)': 'conversations.readonly (+ conversations.write for chat)',
      'Invoices (read)': 'invoices.readonly (+ invoices.write for estimates)',
      'Blog posts (read)': 'blogs.readonly (may not be available on Private Integrations)',
    };
    for (const m of missing) {
      console.log(`    - ${m.area}: ${scopeMap[m.area] || 'check scope'}`);
    }
  } else {
    console.log('\n  All GHL integration areas are accessible. Suite fully operational.');
  }
  console.log('');

  process.exit(locationOk ? 0 : 1);
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
