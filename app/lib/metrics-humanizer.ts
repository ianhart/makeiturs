/**
 * Metrics Humanizer
 *
 * Transforms raw API data (sessions, clicks, reviews, etc.) into warm,
 * human-friendly narrative metrics that business owners actually enjoy reading.
 *
 * Example:
 *   Raw: { sessions: 5677, avgDuration: 72, topPage: "/menu" }
 *   Human: "5,677 people visited your site this week, mostly checking out the menu
 *           for about 1.2 minutes"
 */

import type { ClientMetric } from "./types";
import type { GAMetrics } from "./sync/google-analytics";
import type { GSCMetrics } from "./sync/google-search-console";

// ─── Number Formatting ──────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const mins = seconds / 60;
  if (mins < 2) return `about a minute`;
  return `about ${mins.toFixed(1)} minutes`;
}

function trendEmoji(current: number, target: number): string {
  const ratio = current / target;
  if (ratio >= 1) return "🟢";
  if (ratio >= 0.8) return "🟡";
  return "🔴";
}

function trendStatus(current: number, target: number): "on-track" | "needs-work" | "critical" {
  const ratio = current / target;
  if (ratio >= 1) return "on-track";
  if (ratio >= 0.7) return "needs-work";
  return "critical";
}

// ─── Humanize Google Analytics ──────────────────────────────

export function humanizeAnalytics(ga: GAMetrics): ClientMetric[] {
  const metrics: ClientMetric[] = [];

  // Visitors headline
  const topPageName = ga.topPages[0]?.page?.replace(/^\//, "") || "your site";
  const durationText = fmtDuration(ga.avgSessionDuration);

  metrics.push({
    label: `${fmt(ga.sessions)} people visited your site`,
    value: `Mostly checking out ${topPageName === "" ? "the homepage" : topPageName} for ${durationText}`,
    target: "Growing week over week",
    status: ga.sessions > 100 ? "on-track" : "needs-work",
  });

  // Unique visitors
  metrics.push({
    label: "Unique Visitors",
    value: `${fmt(ga.users)} people found you this week`,
    target: "More is always better",
    status: ga.users > 50 ? "on-track" : "needs-work",
  });

  // Bounce rate
  const bounceNote =
    ga.bounceRate < 0.4
      ? "People are sticking around — great sign!"
      : ga.bounceRate < 0.6
        ? "Some visitors are leaving quickly — let's work on that"
        : "Many visitors are bouncing — landing pages may need attention";
  metrics.push({
    label: "Bounce Rate",
    value: `${fmtPct(ga.bounceRate)} — ${bounceNote}`,
    target: "Under 40%",
    status: trendStatus(1 - ga.bounceRate, 0.6),
  });

  return metrics;
}

// ─── Humanize Search Console ────────────────────────────────

export function humanizeSearchConsole(gsc: GSCMetrics): ClientMetric[] {
  const metrics: ClientMetric[] = [];

  // Search visibility
  metrics.push({
    label: "Google Search Visibility",
    value: `Your site appeared ${fmt(gsc.totalImpressions)} times in Google searches`,
    target: "More impressions = more visibility",
    status: gsc.totalImpressions > 500 ? "on-track" : "needs-work",
  });

  // Clicks from search
  const clickNote =
    gsc.totalClicks > 100
      ? "Strong click-through from search!"
      : gsc.totalClicks > 30
        ? "Decent traffic from Google"
        : "Let's boost those search clicks";
  metrics.push({
    label: "Search Clicks",
    value: `${fmt(gsc.totalClicks)} people clicked through from Google — ${clickNote}`,
    target: "Growing month over month",
    status: gsc.totalClicks > 50 ? "on-track" : "needs-work",
  });

  // Top search query
  if (gsc.topQueries.length > 0) {
    const topQuery = gsc.topQueries[0];
    metrics.push({
      label: "Top Search Term",
      value: `"${topQuery.query}" drove ${fmt(topQuery.clicks)} clicks from ${fmt(topQuery.impressions)} appearances`,
      target: "Brand name in top 3",
      status: "on-track",
    });
  }

  return metrics;
}

// ─── Humanize Review Stats ──────────────────────────────────

export function humanizeReviews(
  googleRating: number,
  googleCount: number,
  yelpRating: number,
  yelpCount: number
): ClientMetric[] {
  const metrics: ClientMetric[] = [];

  if (googleCount > 0) {
    const stars = "⭐".repeat(Math.round(googleRating));
    metrics.push({
      label: "Google Reviews",
      value: `${googleRating.toFixed(1)} stars from ${fmt(googleCount)} happy customers ${stars}`,
      target: "4.5+ stars",
      status: trendStatus(googleRating, 4.5),
    });
  }

  if (yelpCount > 0) {
    metrics.push({
      label: "Yelp Reviews",
      value: `${yelpRating.toFixed(1)} stars from ${fmt(yelpCount)} Yelp reviewers`,
      target: "4.5+ stars",
      status: trendStatus(yelpRating, 4.5),
    });
  }

  return metrics;
}

// ─── Generate Full Narrative ────────────────────────────────

export function generateMetricsNarrative(
  ga?: GAMetrics | null,
  gsc?: GSCMetrics | null,
  googleRating?: number,
  googleReviewCount?: number,
  yelpRating?: number,
  yelpReviewCount?: number
): string {
  const parts: string[] = [];

  if (ga) {
    const topPage = ga.topPages[0]?.page?.replace(/^\//, "") || "the homepage";
    parts.push(
      `This week, ${fmt(ga.sessions)} people visited your site, mostly checking out ${topPage} for ${fmtDuration(ga.avgSessionDuration)}.`
    );
  }

  if (gsc && gsc.totalImpressions > 0) {
    parts.push(
      `Your site appeared ${fmt(gsc.totalImpressions)} times in Google and ${fmt(gsc.totalClicks)} people clicked through.`
    );
  }

  if (googleRating && googleReviewCount) {
    parts.push(
      `You're sitting at ${googleRating.toFixed(1)} stars on Google with ${fmt(googleReviewCount)} reviews.`
    );
  }

  if (yelpRating && yelpReviewCount) {
    parts.push(
      `On Yelp, you've got ${yelpRating.toFixed(1)} stars from ${fmt(yelpReviewCount)} reviews.`
    );
  }

  return parts.join(" ") || "No live metrics data available yet — connect your integrations to see the magic!";
}

// ─── Build Human Metrics Array ──────────────────────────────

export function buildHumanMetrics(
  ga?: GAMetrics | null,
  gsc?: GSCMetrics | null,
  googleRating?: number,
  googleReviewCount?: number,
  yelpRating?: number,
  yelpReviewCount?: number
): ClientMetric[] {
  const metrics: ClientMetric[] = [];

  if (ga) metrics.push(...humanizeAnalytics(ga));
  if (gsc) metrics.push(...humanizeSearchConsole(gsc));
  if (googleRating || yelpRating) {
    metrics.push(
      ...humanizeReviews(
        googleRating || 0,
        googleReviewCount || 0,
        yelpRating || 0,
        yelpReviewCount || 0
      )
    );
  }

  return metrics;
}
