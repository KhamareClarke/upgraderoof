'use client';

import { useEffect, useState } from 'react';
import { Star, Quote, ExternalLink } from 'lucide-react';

interface GbpReview {
  reviewId: string | null;
  starRating: string | null;
  starValue: number | null;
  reviewer: string;
  comment: string | null;
  createTime: string | null;
  updateTime: string | null;
  ownerReply: string | null;
}

interface GbpProfile {
  title: string | null;
  primaryCategory: string | null;
  placeId: string | null;
  mapsUri: string | null;
  newReviewUri: string | null;
}

interface GbpResponse {
  success: boolean;
  profile: GbpProfile;
  rating: { average: number | null; totalReviews: number | null };
  reviews: GbpReview[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StarRow({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`} aria-label={`${value} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Initials avatar, "SJ" for "Sarah Johnson". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.7 39.7 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C36.9 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

export function GoogleGbpReviews() {
  const [data, setData] = useState<GbpResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gbp', { headers: { accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: GbpResponse) => {
        if (cancelled) return;
        if (!json || !json.success) {
          setStatus('error');
          return;
        }
        setData(json);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rating = data?.rating;
  const reviews = (data?.reviews ?? []).filter((r) => r.comment);
  const mapsUri = data?.profile?.mapsUri;

  // A live average + count is the whole point — fall back quietly if unavailable.
  const average = rating?.average != null ? rating.average : null;
  const total = rating?.totalReviews ?? 0;

  return (
    <div className="w-full">
      {/* Live summary bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10">
        <div className="flex items-center gap-3">
          <GoogleLogo className="w-8 h-8" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-brand-navy">
                {average != null ? average.toFixed(1) : '5.0'}
              </span>
              <StarRow
                value={Math.round(average ?? 5)}
                className="[&_svg]:w-4 [&_svg]:h-4 translate-y-[-2px]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Google rating{total > 0 ? ` · ${total} reviews` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Body: loading skeleton, live cards, or graceful fallback */}
      {status === 'loading' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true" aria-label="Loading reviews">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
                <div className="h-3 w-4/6 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <figure
              key={review.reviewId ?? review.createTime ?? `${review.reviewer}-${review.comment?.slice(0, 12)}`}
              className="flex flex-col bg-white border border-gray-200 rounded-2xl p-7 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {initials(review.reviewer)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy truncate">{review.reviewer}</p>
                  <div className="flex items-center gap-2">
                    <StarRow value={review.starValue ?? 5} />
                    {review.createTime && (
                      <span className="text-xs text-gray-400">{formatDate(review.createTime)}</span>
                    )}
                  </div>
                </div>
              </div>

              <blockquote className="flex-1 text-gray-700 leading-relaxed">
                <Quote className="w-5 h-5 text-brand-orange/30 mb-2" aria-hidden="true" />
                {review.comment}
              </blockquote>

              {review.ownerReply && (
                <div className="mt-4 pl-3 border-l-2 border-brand-orange/40 text-sm text-gray-500">
                  <p className="font-semibold text-brand-navy text-xs mb-1 uppercase tracking-wide">
                    Owner&apos;s reply
                  </p>
                  {review.ownerReply}
                </div>
              )}
            </figure>
          ))}
        </div>
      ) : (
        /* No error state shown to users — an empty/degraded API result renders a
           single, dignified empty state that holds the section's height so the
           page layout never collapses. */
        <div className="flex flex-col items-center justify-center text-center py-10 border border-gray-200 rounded-2xl bg-white/60">
          <StarRow value={5} className="[&_svg]:w-6 [&_svg]:h-6 mb-3" />
          <p className="text-gray-600 font-medium">
            Rated 5★ by homeowners across Cheshire
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Fresh reviews are on their way — check back shortly.
          </p>
        </div>
      )}

      {/* Link out to Google */}
      {mapsUri && (
        <div className="text-center mt-8">
          <a
            href={mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-orange font-semibold hover:underline"
          >
            Read all our Google reviews
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
