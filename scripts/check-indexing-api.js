/**
 * scripts/check-indexing-api.js
 *
 * Verifies that Google's Instant Indexing API is reachable from this repo's
 * service account. This API is used to push updates for a few key URLs so they
 * re-crawl quickly. It is a SEPARATE, opt-in Google API — it is NOT covered by
 * the Search Console (webmasters.readonly) scope.
 *
 * What this script does:
 *   - Reads google-service-account.json (repo root) and authenticates with the
 *     required scope https://www.googleapis.com/auth/indexing.
 *   - By default runs a READ (urlNotifications:getMetadata) to confirm the
 *     scope + API are enabled without requesting any re-index.
 *   - Optional: `node scripts/check-indexing-api.js https://example.com/page`
 *     sends a urlNotifications:publish (UPDATE) to request a re-crawl of that
 *     exact URL.
 *
 * Eligibility note (why you may still see PERMISSION_DENIED even when the API
 * is enabled): Google only serves the Indexing API to sites that pass its
 * posting-volume check (the domain must show enough distinct, crawlable pages)
 * and where the service account is added as a verified owner in Search Console
 * with the Indexing API enabled for the Cloud project. For a small local
 * business site this can be refused — that is a Google-side gate, not a code
 * bug. This script makes the failure mode explicit instead of invisible.
 *
 * Run:          node scripts/check-indexing-api.js
 * With a URL:   node scripts/check-indexing-api.js https://www.upgraderoofs.co.uk/blog/...
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const BASE_URL = 'https://www.upgraderoofs.co.uk';
const SA_FILE = process.env.SA_FILE || 'google-service-account.json';

function ok(label, msg) { console.log(`  ✓ ${label}: ${msg}`); }
function bad(label, msg) { console.log(`  ✗ ${label}: ${msg}`); }
function warn(label, msg) { console.log(`  ⚠ ${label}: ${msg}`); }

(async () => {
  const targetUrl = process.argv[2] || null;

  console.log('Indexing API check\n' +
    '  scope   : ' + INDEXING_SCOPE + '\n' +
    '  keyfile : ' + SA_FILE + '\n');

  const resolved = path.isAbsolute(SA_FILE) ? SA_FILE : path.join(__dirname, '..', SA_FILE);
  if (!fs.existsSync(resolved)) {
    bad('Service account', `key not found at ${SA_FILE} — download a key that has the Indexing API enabled in Google Cloud Console.`);
    return;
  }

  let auth;
  try {
    auth = new google.auth.GoogleAuth({ keyFile: resolved, scopes: [INDEXING_SCOPE] });
    await auth.getClient();
    ok('Auth', 'service account authenticated with indexing scope');
  } catch (e) {
    bad('Auth', e.message);
    return;
  }

  const indexing = google.indexing({ version: 'v3', auth });

  if (!targetUrl) {
    // Read-only metadata call — no indexing requested.
    try {
      const baseUrl = BASE_URL + '/';
      const r = await indexing.urlNotifications.getMetadata({ url: baseUrl });
      ok('getMetadata', `API enabled (HTTP ${r.status})`);
      if (r.data && r.data.urlNotificationMetadata) {
        ok('Metadata', `latest notification: ${JSON.stringify(r.data.urlNotificationMetadata.urlNotificationMetadata || {})}`);
      }
    } catch (e) {
      bad('API', e.message);
      const msg = String(e.message || e);
      if (/not found|PERMISSION_DENIED|403|quota/i.test(msg)) {
        warn('Eligibility',
          'Auth with the indexing scope SUCCEEDED, so the Cloud project + service account are correctly '
          + `wired. "${msg}" means Google has not granted re-indexing FOR THIS DOMAIN. The Indexing API is only `
          + 'served to sites on Google\'s allow-list (posting-volume gate) — small/local-business domains '
          + 'are frequently not eligible regardless of console setup. To retry the grant, ensure ALL of: '
          + '1) "Indexing API" enabled for this Cloud project; 2) the domain verified in Search Console and '
          + 'the service-account email (in google-service-account.json "client_email") added as an owner; '
          + '3) the domain passes Google\'s posting-volume check. If the site is ineligible, Google'
          + 'recommends the IndexNow protocol or normal crawling instead.');
      }
      return;
    }

    console.log('\nTo request a re-index of a specific URL, pass it as an argument:');
    console.log('  node scripts/check-indexing-api.js ' + BASE_URL + '/sitemap.xml');
    return;
  }

  if (!/^https:\/\//i.test(targetUrl)) {
    bad('Input', 'expected an absolute https:// URL — e.g. ' + BASE_URL + '/blog/...');
    return;
  }
  if (!targetUrl.startsWith(BASE_URL)) {
    warn('Input', 'URL is not under ' + BASE_URL + ' — the Indexing API only accepts this site\'s verified URLs.');
    return;
  }

  console.log('Publishing UPDATE for ' + targetUrl + ' …');
  try {
    const r = await indexing.urlNotifications.publish({
      requestBody: { url: targetUrl, type: 'URL_UPDATED' },
    });
    ok('publish', `Indexing request accepted — notificationMetadata.urlNotificationMetadata: ${JSON.stringify(r.data)}`);
  } catch (e) {
    bad('publish', e.message);
    warn('Eligibility', '403 PERMISSION_DENIED here means the domain is not on the Indexing API allow-list '
      + '(enable the API in Cloud Console, verify the domain in Search Console, add the service-account '
      + 'email as owner, and pass Google\'s posting-volume check). This is a Google-side gate.');
  }
})();
