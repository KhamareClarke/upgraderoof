/**
 * lib/google-indexing.js
 *
 * Thin wrapper around the Google Indexing API (v3) — lets us ask Google to
 * (re)crawl a URL, typically after a page is published or updated.
 *
 * Auth: Google service account (JSON key file), NOT user OAuth. The service
 * account must have:
 *   1. The Indexing API enabled in its GCP project (`upgraderoofs-api`).
 *   2. The service account email added as an owner (with "Full" permission)
 *      on the verified property in Google Search Console, since the Indexing
 *      API operates against a verified site.
 *
 * Key file resolution order:
 *   - GOOGLE_APPLICATION_CREDENTIALS (absolute path), else
 *   - ./google-service-account.json relative to the repo root.
 *
 * This module is used by scripts only (googleapis is a devDependency) — it
 * must NOT be imported into the serverless runtime routes.
 */
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

/**
 * Ask Google to index `url`.
 *
 * @param {string} url  Fully-qualified URL to submit.
 * @param {'URL_UPDATED'|'URL_DELETED'} type  Default 'URL_UPDATED'.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function submitUrlForIndexing(url, type = 'URL_UPDATED') {
  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: SCOPES,
    });
    const client = await auth.getClient();
    const indexing = google.indexing({ version: 'v3', auth: client });

    const response = await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });

    return { success: true, data: response.data };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    return { success: false, error: message };
  }
}

module.exports = { submitUrlForIndexing };
