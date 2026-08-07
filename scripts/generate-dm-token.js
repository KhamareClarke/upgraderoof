/**
 * scripts/generate-dm-token.js
 *
 * One-time OAuth consent flow to mint a REFRESH TOKEN for the Data Manager API
 * (datamanager.googleapis.com). The Data Manager API needs scope
 * https://www.googleapis.com/auth/datamanager — a DIFFERENT scope than the
 * Google Ads API (adwords), so you must create a NEW OAuth client in Google
 * Cloud with this scope and mint a fresh refresh token. The existing
 * GOOGLE_ADS_* credentials cannot be reused.
 *
 * Before running:
 *   1. Enable "Data Manager API" in Cloud Console (APIs & Services → Library).
 *   2. Create a NEW OAuth client ID, type "Desktop app".
 *      (APIs & Services → Credentials → Create Credentials → OAuth client ID)
 *   3. Add these to .env.local:
 *        GOOGLE_DM_CLIENT_ID=xxxxx.apps.googleusercontent.com
 *        GOOGLE_DM_CLIENT_SECRET=GOCSPX-...
 *   4. Run:  node scripts/generate-dm-token.js
 *   5. Open the printed URL, authorize, paste back the redirect URL or code.
 *   6. Put the printed GOOGLE_DM_REFRESH_TOKEN into .env.local (and later Vercel).
 *
 * NOTE: On the consent screen you may get a "Google hasn't verified this app"
 * warning because the app is in a test/unpublished state — click "Advanced" →
 * "Go to <project> (unsafe)" to proceed. This is fine for a personal project
 * OAuth client. If the refresh token comes back empty, you hit the "consent
 * not shown" case — the project may not be in "Testing" status or the client
 * may need the consent screen configured; re-run and ensure prompt=consent
 * fired (it is set below).
 */
const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const CLIENT_ID = process.env.GOOGLE_DM_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DM_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_DM_CLIENT_ID or GOOGLE_DM_CLIENT_SECRET in .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/datamanager'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  response_type: 'code',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n' + '='.repeat(70));
console.log('  DATA MANAGER API — OAUTH CONSENT (scope: datamanager)');
console.log('='.repeat(70));
console.log('STEP 1 — Open this URL in your browser and authorize:');
console.log('\n' + authUrl + '\n');

const provided = process.argv[2];
console.log(
  'STEP 2 — Re-run this script passing the FULL redirect URL as the 3rd arg, e.g.:\n'
  + '  node scripts/generate-dm-token.js "http://localhost:8080/?code=4/0A..."\n'
  + (provided ? `  -> received argument (${provided.length} chars): ${provided}\n` : '')
);

async function mint(codeOrUrl) {
  try {
    let code = codeOrUrl.trim();
    if (code.startsWith('http')) {
      const urlObj = new URL(code);
      code = urlObj.searchParams.get('code');
    }
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      console.error('\nNo refresh_token returned. Consent screen likely did not show.\n'
        + 'Ensure the OAuth client is a "Desktop app" under a project in "Testing"\n'
        + 'mode and the datamanager scope is enabled, then re-run.');
      process.exit(1);
    }
    console.log('\nSUCCESS. Add this to .env.local (and Vercel):\n');
    console.log(`GOOGLE_DM_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log(`\nAccess token (expires ~1h) also minted for your session test.\n`);
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
    process.exit(1);
  }
}

if (provided) {
  mint(provided);
} else {
  console.log('\nNo code provided on the command line. Run with the redirect URL as arg 2, e.g.:');
  console.log('  node scripts/generate-dm-token.js "http://localhost:8080/?code=4/0A..."');
  process.exit(0);
}
