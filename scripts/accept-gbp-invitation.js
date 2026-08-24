/**
 * scripts/accept-gbp-invitation.js
 *
 * Accepts the pending Google Business Profile manager invitation for the
 * Upgrade Roofs listing, using the *service account* credentials
 * (roofing-audit-bot-upgraderoofs@upgraderoofs-api.iam.gserviceaccount.com)
 * rather than an interactive user OAuth flow.
 *
 * Flow:
 *   1. accounts.invitations.list  → find the pending invitation(s) addressed to
 *      the service account (filter by invitee / targetAccount).
 *   2. accounts.invitations.accept → accept each matching invitation.
 *
 * NOTE — the Account Management API surfaces `invitations.accept` via a POST to
 *   `v1/{name}:accept` with an AcceptInvitationRequest body whose `account`
 *   field is the MANAGER account resource name (accounts/{id}) that the invitee
 *   is accepting into. The invitation `name` is in the form
 *   accounts/{inviterId}/invitations/{invitationId}.
 *
 * Run:  node scripts/accept-gbp-invitation.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

function resolveKeyFile() {
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json')
  );
}

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: resolveKeyFile(),
    scopes: SCOPES,
  });
  return auth.getClient();
}

// Use the Account Management API client from googleapis.
async function main() {
  const keyFile = resolveKeyFile();
  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key file not found: ${keyFile}`);
    process.exit(2);
  }

  const client = await getAuthClient();
  const acctMgmt = google.mybusinessaccountmanagement({ version: 'v1', auth: client });

  // 1. List accounts the service account can see (its manager account must
  //    already exist / be discoverable to have an invitation resolvable).
  const accountsRes = await acctMgmt.accounts.list();
  const accounts = accountsRes.data.accounts || [];
  console.log('Service-account-accessible accounts:');
  for (const a of accounts) {
    console.log(`  ${a.name}  (${a.accountName || a.type || '?'})`);
  }

  // 2. Discover pending invitations. Invitations are listed under the INVITER
  //    account. Since we may not know the inviter account name, scan each
  //    account we can see, plus try the target location's owner account id.
  const invitations = [];

  for (const acct of accounts) {
    try {
      const invRes = await acctMgmt.accounts.invitations.list({ parent: acct.name });
      const invs = invRes.data.invitations || [];
      for (const inv of invs) {
        invitations.push({ ...inv, listParent: acct.name });
      }
    } catch (e) {
      // Not every account exposes invitations to this caller; skip.
      console.error(`  [warn] invitations.list on ${acct.name}: ${e.message}`);
    }
  }

  console.log(`\nFound ${invitations.length} invitation(s).`);
  for (const inv of invitations) {
    console.log(
      `  name=${inv.name}  role=${inv.role}  state=${inv.state}  targetAccount=${inv.targetAccount?.name || '?'}  invitee=${inv.invitee || '?'}`
    );
  }

  if (invitations.length === 0) {
    console.log('\nNo invitations found. Nothing to accept.');
    process.exit(0);
  }

  // 3. Accept each invitation. AcceptInvitationRequest is an EMPTY object — the
  //    invitation's `name` carries the target account/location, so no body
  //    fields are required.
  let accepted = 0;
  for (const inv of invitations) {
    try {
      const res = await acctMgmt.accounts.invitations.accept({
        name: inv.name,
        requestBody: {},
      });
      console.log(`  ✔ accepted ${inv.name} →`, JSON.stringify(res.data));
      accepted++;
    } catch (e) {
      console.error(`  ✖ failed to accept ${inv.name}:`, e.message);
    }
  }

  console.log(`\nDone. Accepted ${accepted}/${invitations.length} invitation(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error in accept-gbp-invitation:', err);
  process.exit(1);
});
