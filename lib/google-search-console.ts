/**
 * lib/google-search-console.ts
 *
 * Utility to pull top search queries + click metrics from Google Search
 * Console for https://www.upgraderoofs.co.uk using a service account.
 *
 * Auth: service-account JSON key file, read from
 * `process.env.GOOGLE_APPLICATION_CREDENTIALS` (falling back to the repo-root
 * `google-service-account.json`), scope `webmasters.readonly`. The service
 * account must be a verified user on the Search Console property.
 *
 * NOTE ON `googleapis` TYPES: recent `googleapis` ships its own TS types
 * (including `google.searchconsole('v1')`), so `@types/googleapis` is NOT
 * required. This module is consumed by scripts only (`googleapis` is a
 * devDependency); do not import it into the serverless runtime routes.
 */

import { google, searchconsole_v1 } from 'googleapis';
import * as path from 'path';

/** A single GSC query row, keyed by search query, with its core metrics. */
export interface SearchQueryMetric {
  /** The search term users typed. */
  query: string;
  clicks: number;
  impressions: number;
  /** Click-through rate (clicks / impressions), 0 when there are no impressions. */
  ctr: number;
  /** Average position in search results (lower is better; 1 is the top). */
  position: number;
}

/** Aggregate totals for the queried window (view-independent). */
export interface SearchConsoleTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  /** Weighted average position across all rows. */
  averagePosition: number;
}

export interface SearchConsoleResult {
  /** Rows sorted by clicks descending. */
  queries: SearchQueryMetric[];
  totals: SearchConsoleTotals;
  /** ISO date range actually queried. */
  dateRange: { startDate: string; endDate: string };
  siteUrl: string;
}

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const DEFAULT_SITE_URL = 'https://www.upgraderoofs.co.uk/';

function resolveKeyFile(): string {
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json')
  );
}

/** Build an authorized Search Console client from the service account. */
async function getSearchConsoleClient(): Promise<searchconsole_v1.Searchconsole> {
  const auth = new google.auth.GoogleAuth({
    keyFile: resolveKeyFile(),
    scopes: [GSC_SCOPE],
  });
  return google.searchconsole({ version: 'v1', auth });
}

function isoDateDaysAgo(daysAgo: number, now: Date = new Date()): string {
  const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function isoToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Query GSC for the top search queries (and their click metrics) driving
 * traffic to `siteUrl` over the given window.
 *
 * @param siteUrl   Verified Search Console property, e.g. 'https://www.upgraderoofs.co.uk/'.
 * @param startDate ISO date (YYYY-MM-DD). Defaults to 28 days ago.
 * @param endDate   ISO date (YYYY-MM-DD). Defaults to today.
 * @param rowLimit  Max query rows to return. Default 25.
 */
export async function getTopQueries(
  siteUrl: string = DEFAULT_SITE_URL,
  startDate: string = isoDateDaysAgo(28),
  endDate: string = isoToday(),
  rowLimit: number = 25,
): Promise<SearchConsoleResult> {
  const sc = await getSearchConsoleClient();
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit,
    },
  });

  const rows: Array<
    searchconsole_v1.Schema$ApiDataRow | undefined
  > = res.data.rows || [];

  const queries: SearchQueryMetric[] = rows
    .filter((r): r is searchconsole_v1.Schema$ApiDataRow => !!r)
    .filter((r) => typeof r.keys?.[0] === 'string')
    .map((r) => {
      const clicks = Number(r.clicks) || 0;
      const impressions = Number(r.impressions) || 0;
      const position = Number(r.position) || 0;
      return {
        query: r.keys![0] as string,
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const totals: SearchConsoleTotals = queries.reduce(
    (acc, q) => ({
      clicks: acc.clicks + q.clicks,
      impressions: acc.impressions + q.impressions,
      ctr: 0,
      // position weighting is computed after the reduce loop.
      averagePosition: acc.averagePosition + q.position * q.impressions,
    }),
    { clicks: 0, impressions: 0, ctr: 0, averagePosition: 0 },
  );
  totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  totals.averagePosition =
    totals.impressions > 0 ? totals.averagePosition / totals.impressions : 0;

  return {
    queries,
    totals,
    dateRange: { startDate, endDate },
    siteUrl,
  };
}
