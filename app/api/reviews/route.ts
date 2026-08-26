import { NextResponse } from 'next/server';
import { getGoogleReviews } from '@/lib/ghl';

/**
 * app/api/reviews/route.ts
 *
 * Homepage review cards, backed by GoHighLevel's Reviews API rather than the
 * Google Business Profile service account (which requires a Manager grant +
 * key-file deployment that has never shipped to prod). GHL mirrors the
 * location's Google reviews once the Reviews integration is connected.
 *
 * GET https://www.upgraderoofs.co.uk/api/reviews
 *
 * Env (server, shared with the rest of lib/ghl.ts):
 *   GHL_LOCATION_ID   location / sub-account id
 *   GHL_API_KEY       Private Integration token (location-scoped)
 *
 * Response:
 *   { success: true, rating: { average, totalReviews }, reviews: [...] }
 *
 * GHL does not expose the aggregate average/count on this endpoint, so the
 * average is computed locally from the returned reviews; totalReviews is the
 * count of reviews returned (not necessarily the profile total).
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const reviews = await getGoogleReviews(5);

  const starred = reviews.filter((r) => r.starValue != null && r.starValue > 0);
  const average =
    starred.length > 0
      ? starred.reduce((sum, r) => sum + (r.starValue as number), 0) / starred.length
      : null;

  return NextResponse.json({
    success: true,
    rating: {
      average: average != null ? Number(average.toFixed(1)) : null,
      totalReviews: reviews.length,
    },
    reviews,
  });
}
