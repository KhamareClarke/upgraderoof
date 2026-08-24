/**
 * scripts/test-indexing.js
 *
 * Validates that the Google service account can successfully push a URL to
 * the Google Indexing API via lib/google-indexing.js.
 *
 * Run:  node scripts/test-indexing.js
 *
 * Prereqs (server-side, not checked here):
 *   1. Indexing API enabled in the `upgraderoofs-api` GCP project.
 *   2. Service account email added as an owner (Full permission) on the
 *      verified Search Console property.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const path = require('path');
const { submitUrlForIndexing } = require(path.join(__dirname, '..', 'lib', 'google-indexing.js'));

const TARGET_URL = 'https://www.upgraderoofs.co.uk';

async function runTest() {
  console.log(`Testing Indexing API handshake for: ${TARGET_URL}\n`);

  // Resolve the key file exactly as the module will, so we can give a useful
  // message if it's missing before the request is attempted.
  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json');
  const fs = require('fs');
  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key file not found: ${keyFile}`);
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or place google-service-account.json at the repo root.');
    process.exit(2);
  }

  const result = await submitUrlForIndexing(TARGET_URL, 'URL_UPDATED');

  console.log('Result:', JSON.stringify(result, null, 2));

  if (!result.success) {
    console.error('\nIndexing submission FAILED.');
    console.error('Common causes:');
    console.error('  - Indexing API not enabled for the service-account project');
    console.error('  - Service account not an owner of the Search Console property');
    console.error('  - HTTPS/URL ownership (site must be verified in Search Console)');
    process.exit(1);
  }

  const meta = result.data && result.data.urlNotificationMetadata;
  if (meta) {
    console.log('\nGoogle acknowledged the request:');
    console.log('  url        →', meta.url);
    console.log('  latestUpdate →', JSON.stringify(meta.latestUpdate));
  }

  console.log('\nIndexing submission succeeded.');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Unexpected error in test-indexing:', err);
  process.exit(1);
});
