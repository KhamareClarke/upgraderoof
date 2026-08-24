/**
 * scripts/generate-gbp-token.js
 *
 * Mints a fresh GBP OAuth refresh token using the interactive OAuth2 consent
 * flow via a local HTTP loopback server. Use this when the existing
 * GBP_REFRESH_TOKEN is stale (e.g. after a client-secret rotation) OR when the
 * token was minted against the wrong Google account (one that does not
 * own/verify the business listing).
 *
 * WHY THIS EXISTS (Path 1):
 *   The `business.manage` scope token only surfaces `averageRating` +
 *   `totalReviewCount` (via the legacy My Business v4 reviews endpoint) when
 *   the authorizing account genuinely OWNs the verified location. A token
 *   minted from a personal/unverified account returns 404 on the v4 reviews
 *   endpoint even though it can list locations via the Business Information
 *   API. Re-minting from the account that owns the listing fixes this.
 *
 *   IMPORTANT: run this *as* (or with the consent of) the Google account that
 *   owns the "Upgrade Roofs" GBP profile — not a personal account that merely
 *   has listing access.
 *
 * Run:  node scripts/generate-gbp-token.js
 *
 * The script:
 *   1. Starts a local HTTP server on REDIRECT_PORT.
 *   2. Prints a URL. Open it in a browser signed in as the OWNING account.
 *   3. Approve. Google redirects back to http://localhost:REDIRECT_PORT/?code=...
 *   4. The local server captures `code` automatically (no copy-paste).
 *   5. The code is exchanged for a refresh token, written directly to
 *      .env.local as GBP_REFRESH_TOKEN.
 *
 * NOTE: the OAuth client is a "Web application" type. Its Authorized redirect
 * URI must include exactly  http://localhost:3000  (the REDIRECT_PORT below).
 * If Google returns "redirect_uri_mismatch", add that URI to the client in
 * GCP Console → APIs & Services → Credentials → OAuth 2.0 Client IDs →
 * <GBP_CLIENT_ID> → Authorized redirect URIs — OR set GBP_REDIRECT_URI in
 * .env.local to a URI that is already registered and matching this port/path.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

const REDIRECT_PORT = Number(process.env.GBP_REDIRECT_PORT || 3000);
const REDIRECT_URI = process.env.GBP_REDIRECT_URI || `http://localhost:${REDIRECT_PORT}`;

const ENV_PATH = path.join(__dirname, '..', '.env.local');

function writeRefreshToken(token) {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => /^GBP_REFRESH_TOKEN=/.test(l));
  const newLine = `GBP_REFRESH_TOKEN=${token}`;
  if (idx >= 0) {
    lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }
  fs.writeFileSync(ENV_PATH, lines.join('\n') + (raw.endsWith('\n') ? '\n' : ''));
  console.log(`\nWrote GBP_REFRESH_TOKEN to ${ENV_PATH}\n`);
}

async function main() {
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET) {
    console.error('Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline', // -> returns a refresh token
    prompt: 'consent',      // force a fresh grant (so a refresh token is always returned)
    scope: SCOPES,
  });

  console.log('\nOpen this URL in a browser signed in as the account that OWNS the listing:\n');
  console.log('  ' + authUrl + '\n');
  console.log(`Waiting for Google to redirect back to ${REDIRECT_URI} ...`);

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, REDIRECT_URI);
    const code = u.searchParams.get('code');
    const error = u.searchParams.get('error');

    if (!code && !error) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Waiting for authorization…</h1>');
      return;
    }

    if (error) {
      console.error(`\nOAuth error returned: ${error}\n`);
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authorization failed: ${error}</h1>`);
      server.close(() => process.exit(1));
      return;
    }

    // Success path — exchange the code as soon as we have it.
    try {
      const { tokens } = await oauth2.getToken(code);
      if (!tokens.refresh_token) {
        throw new Error(
          'No refresh token in response. Re-run after revoking prior access at ' +
            'https://myaccount.google.com/permissions'
        );
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authorization successful — you can close this tab.</h1>');

      writeRefreshToken(tokens.refresh_token);
      console.log('Refresh token minted and written to .env.local.');
      console.log('\nCopy it into Vercel production env (GBP_REFRESH_TOKEN) and redeploy.\n');
      console.log('Keep it secret — do not commit it.');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('Error exchanging code:', err.message || err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Token exchange failed — check the console.</h1>');
      server.close(() => process.exit(1));
    }
  });

  server.listen(REDIRECT_PORT, () => {
    // Ready; nothing else to do — the callback drives completion.
  });

  server.on('error', (err) => {
    console.error('Failed to start loopback server:', err.message);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Error minting token:', err.message || err);
  process.exit(1);
});
