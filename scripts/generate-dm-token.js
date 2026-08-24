/**
 * scripts/generate-dm-token.js
 *
 * Mints a fresh Data Manager (Google Ads offline conversions) OAuth refresh
 * token using the interactive OAuth2 consent flow via a local HTTP loopback
 * server. Patching this live token over the GOOGLE_DM_REFRESH_TOKEN placeholder
 * is the fix for the broken offline-conversion pipeline.
 *
 * WHY THIS EXISTS:
 *   Offline click conversions (GHL "Site Visit Booked" / "Job Won" uploads) can
 *   no longer be posted through the legacy ConversionUploadService — Google Ads
 *   now requires the Data Manager API, which uses a DIFFERENT OAuth scope than
 *   the Google Ads API:
 *       https://www.googleapis.com/auth/datamanager
 *   The existing GOOGLE_DM_REFRESH_TOKEN in .env.local is the literal string
 *   "added and reployed" (a placeholder), so every offline upload is currently
 *   broken. This script mints a real refresh token for that scope and writes it
 *   back into .env.local, replacing the placeholder.
 *
 * Run:  node scripts/generate-dm-token.js
 *
 * The script:
 *   1. Starts a local HTTP server on REDIRECT_PORT.
 *   2. Prints a URL. Open it in a browser signed in as the account that manages
 *      the Google Ads customer (8479028400 / MCC 7317123591).
 *   3. Approve. Google redirects back to http://localhost:<REDIRECT_PORT>/?code=...
 *   4. The local server captures `code` automatically (no copy-paste).
 *   5. The code is exchanged for a refresh token, written directly to
 *      .env.local as GOOGLE_DM_REFRESH_TOKEN.
 *
 * NOTE: the OAuth client ("Data Manager API" client) is a "Web application"
 * type. Its Authorized redirect URI must include exactly http://localhost:<port>.
 * If Google returns "redirect_uri_mismatch", add that URI in GCP Console →
 * APIs & Services → Credentials → <GOOGLE_DM_CLIENT_ID> → Authorized redirect
 * URIs — OR set DM_REDIRECT_URI in .env.local to an already-registered URI.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/datamanager'];

const REDIRECT_PORT = Number(process.env.DM_REDIRECT_PORT || process.env.GBP_REDIRECT_PORT || 3000);
const REDIRECT_URI = process.env.DM_REDIRECT_URI || `http://localhost:${REDIRECT_PORT}`;

const ENV_PATH = path.join(__dirname, '..', '.env.local');

function writeRefreshToken(token) {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => /^GOOGLE_DM_REFRESH_TOKEN=/.test(l));
  const newLine = `GOOGLE_DM_REFRESH_TOKEN=${token}`;
  if (idx >= 0) {
    lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }
  fs.writeFileSync(ENV_PATH, lines.join('\n') + (raw.endsWith('\n') ? '\n' : ''));
  console.log(`\nWrote GOOGLE_DM_REFRESH_TOKEN to ${ENV_PATH}\n`);
}

async function main() {
  // Data Manager uses the dedicated OAuth client, not the Google Ads one.
  const { GOOGLE_DM_CLIENT_ID, GOOGLE_DM_CLIENT_SECRET } = process.env;
  if (!GOOGLE_DM_CLIENT_ID || !GOOGLE_DM_CLIENT_SECRET) {
    console.error('Missing GOOGLE_DM_CLIENT_ID / GOOGLE_DM_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(GOOGLE_DM_CLIENT_ID, GOOGLE_DM_CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline', // -> returns a refresh token
    prompt: 'consent',      // force a fresh grant (so a refresh token is always returned)
    scope: SCOPES,
  });

  console.log('\nOpen this URL in a browser signed in as the account that manages the Google Ads customer:\n');
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
      console.log('Refresh token minted and written to .env.local (GOOGLE_DM_REFRESH_TOKEN).');
      console.log('\nCopy it into Vercel production env (GOOGLE_DM_REFRESH_TOKEN) and redeploy.\n');
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
