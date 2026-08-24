import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as path from 'path';

/**
 * app/api/gbp/route.ts
 *
 * Google Business Profile API — returns profile details + recent reviews for
 * the Upgrade Roofs location, authenticated by a service account
 * (`business.manage` scope). This removes the user OAuth refresh-token loop and
 * the unverified/personal-account wall entirely.
 *
 * GET https://www.upgraderoofs.co.uk/api/gbp
 *
 * Env required (server):
 *   GOOGLE_APPLICATION_CREDENTIALS — path to a service-account JSON key file
 *     (defaults to ./google-service-account.json). The service account must be
 *     added as a Manager on the verified "Upgrade Roofs" Business Profile.
 *   (optional) GBP_ACCOUNT_ID — My Business account id, e.g. accounts/123456789.
 *     When omitted, the route lists the accounts the caller can access and uses
 *     the one that owns the target location (locations/17098906572808840).
 *
 * Data returned:
 *   - "profile": name, title, verification + primary category, phone, place/maps
 *     URLs, plus the location resource name.
 *   - "rating": average rating (1–5) and total review count.
 *   - "reviews": array of recent reviews (star rating, reviewer, comment, time,
 *     and any owner reply).
 */

const GBP_SCOPES = ['https://www.googleapis.com/auth/business.manage'];

const TARGET_LOCATION_ID = '17098906572808840';

const REVIEW_COUNT = 5;

const STAR_VALUE: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function resolveKeyFile(): string {
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json')
  );
}

async function getGbpClient(): Promise<{ accessToken: string }> {
  const auth = new google.auth.GoogleAuth({
    keyFile: resolveKeyFile(),
    scopes: GBP_SCOPES,
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error('GBP service-account access token exchange failed');
  }
  return { accessToken: token };
}

/** Raw GET helper enforcing JSON parse + throwing on non-2xx status. */
function jsonGet(
  host: string,
  path: string,
  accessToken: string,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const https = require('https') as typeof import('https');
    const req = https.request(
      {
        host,
        path,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = { raw: data };
          }
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const err = new Error(
              `GBP API HTTP ${res.statusCode}: ${data.slice(0, 400)}`
            ) as Error & { status?: number };
            err.status = res.statusCode;
            reject(err);
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

/** Resolve accounts/{acctId}/locations/{locId} for the target location. */
async function resolveLocationName(accessToken: string): Promise<string> {
  // Fast path: caller pinned the account id.
  const pinned = process.env.GBP_ACCOUNT_ID?.trim();
  if (pinned) {
    const acct = pinned.replace(/^accounts\//, '');
    return `accounts/${acct}/locations/${TARGET_LOCATION_ID}`;
  }

  // Otherwise: list accounts, then list each account's locations and match the
  // target location id. Most accounts expose a single location.
  const acctRes: any = await jsonGet(
    'mybusinessaccountmanagement.googleapis.com',
    '/v1/accounts',
    accessToken,
  );
  const accounts: any[] = acctRes.accounts || [];

  for (const acct of accounts) {
    const accountName: string = acct.name; // accounts/{id}
    const locRes: any = await jsonGet(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/${accountName}/locations?readMask=name&pageSize=100`,
      accessToken,
    );
    const locations: any[] = locRes.locations || [];
    for (const loc of locations) {
      if (loc.name && loc.name.includes(`locations/${TARGET_LOCATION_ID}`)) {
        return loc.name;
      }
    }
  }

  throw new Error(
    `Target location locations/${TARGET_LOCATION_ID} not found in accessible accounts`
  );
}

export async function GET(_request: NextRequest) {
  try {
    const { accessToken } = await getGbpClient();

    const locationName = await resolveLocationName(accessToken);
    const accountId = locationName.split('/')[1];
    const locationId = locationName.split('/').pop();

    // 1. Business profile details (Business Information API v1).
    const detail: any = await jsonGet(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/${locationName}?readMask=name,title,metadata,profile,phoneNumbers,categories,websiteUri`,
      accessToken,
    );

    // 2. Reviews + rating (legacy My Business v4, the only endpoint exposing
    //    the average rating + review count).
    const reviewsRes: any = await jsonGet(
      'mybusiness.googleapis.com',
      `/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${REVIEW_COUNT}&orderBy=updateTime%20desc`,
      accessToken,
    );

    const metadata = detail.metadata || {};
    const profile = {
      name: locationName,
      title: detail.title || null,
      primaryCategory: detail.categories?.primaryCategory?.displayName || null,
      phone: detail.phoneNumbers?.primaryPhone || null,
      websiteUri: detail.websiteUri || null,
      placeId: metadata.placeId || null,
      mapsUri: metadata.mapsUri || null,
      newReviewUri: metadata.newReviewUri || null,
      hasVoiceOfMerchant: metadata.hasVoiceOfMerchant ?? null,
      hasPendingEdits: metadata.hasPendingEdits ?? null,
    };

    const rating = {
      average: reviewsRes.averageRating != null ? Number(reviewsRes.averageRating) : null,
      totalReviews: reviewsRes.totalReviewCount != null ? Number(reviewsRes.totalReviewCount) : null,
    };

    const reviews: any[] = (reviewsRes.reviews || []).map((r: any) => ({
      reviewId: r.reviewId || null,
      starRating: r.starRating || null,
      starValue: r.starRating ? STAR_VALUE[r.starRating] ?? null : null,
      reviewer: r.reviewer?.displayName || 'Anonymous',
      comment: r.comment || null,
      createTime: r.createTime || null,
      updateTime: r.updateTime || null,
      ownerReply: r.reviewReply?.comment || null,
    }));

    return NextResponse.json({
      success: true,
      locationId,
      accountId,
      profile,
      rating,
      reviews,
    });
  } catch (error: any) {
    const message = error?.message || String(error);
    const status = error?.status && Number(error.status) ? Number(error.status) : 500;
    console.error('[gbp] error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
