/**
 * Review Aggregator
 *
 * Combines reviews from Google Business and Yelp, generates:
 *   - Platform summary stats (for ReviewPlatform[] in portal)
 *   - Weekly vibe narrative
 *   - Positive/negative themes
 *   - Recent individual reviews sorted by date
 */

import type { IndividualReview, ReviewPlatform } from "../types";

export interface AggregatedReviews {
  platforms: ReviewPlatform[];
  recentReviews: IndividualReview[];
  positiveThemes: string[];
  negativeThemes: string[];
  weeklyVibe: string;
}

// ─── Platform Stats ──────────────────────────────────────────

function buildPlatformStats(
  googleRating: number,
  googleCount: number,
  yelpRating: number,
  yelpCount: number,
  googleReviews: IndividualReview[],
  yelpReviews: IndividualReview[]
): ReviewPlatform[] {
  const platforms: ReviewPlatform[] = [];

  if (googleCount > 0 || googleReviews.length > 0) {
    // Count reviews with replies
    const withReplies = googleReviews.filter((r) => r.replyText).length;
    const total = googleReviews.length || 1;
    const responseRate = Math.round((withReplies / total) * 100);

    platforms.push({
      platform: "Google",
      rating: `${googleRating.toFixed(1)}/5`,
      reviewCount: googleCount,
      responseRate: `${responseRate}%`,
    });
  }

  if (yelpCount > 0 || yelpReviews.length > 0) {
    platforms.push({
      platform: "Yelp",
      rating: `${yelpRating.toFixed(1)}/5`,
      reviewCount: yelpCount,
      responseRate: "N/A", // Yelp doesn't show response rate via API
    });
  }

  return platforms;
}

// ─── Theme Extraction (keyword-based) ────────────────────────

const POSITIVE_KEYWORDS = [
  "fresh",
  "delicious",
  "amazing",
  "great",
  "excellent",
  "friendly",
  "fast",
  "clean",
  "beautiful",
  "love",
  "best",
  "recommend",
  "perfect",
  "wonderful",
  "fantastic",
  "awesome",
  "tasty",
  "good",
  "healthy",
  "quick",
];

const NEGATIVE_KEYWORDS = [
  "slow",
  "wait",
  "cold",
  "expensive",
  "price",
  "rude",
  "dirty",
  "small",
  "portion",
  "wrong",
  "mistake",
  "bad",
  "terrible",
  "worst",
  "disappointing",
  "overpriced",
  "mediocre",
  "bland",
  "stale",
];

function extractThemes(
  reviews: IndividualReview[]
): { positive: string[]; negative: string[] } {
  const positiveCounts: Record<string, number> = {};
  const negativeCounts: Record<string, number> = {};

  for (const review of reviews) {
    const lower = (review.text || "").toLowerCase();

    for (const keyword of POSITIVE_KEYWORDS) {
      if (lower.includes(keyword)) {
        positiveCounts[keyword] = (positiveCounts[keyword] || 0) + 1;
      }
    }

    for (const keyword of NEGATIVE_KEYWORDS) {
      if (lower.includes(keyword)) {
        negativeCounts[keyword] = (negativeCounts[keyword] || 0) + 1;
      }
    }
  }

  // Sort by frequency, take top themes
  const sortByCount = (counts: Record<string, number>) =>
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

  const positive = sortByCount(positiveCounts).map(([keyword, count]) => {
    const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    return count > 1 ? `${capitalized} (${count} mentions)` : capitalized;
  });

  const negative = sortByCount(negativeCounts).map(([keyword, count]) => {
    const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    return count > 1 ? `${capitalized} (${count} mentions)` : capitalized;
  });

  return { positive, negative };
}

// ─── Weekly Vibe Generator ───────────────────────────────────

function generateWeeklyVibe(
  reviews: IndividualReview[],
  avgRating: number
): string {
  if (reviews.length === 0) {
    return "No new reviews this week — a quiet one!";
  }

  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;
  const total = reviews.length;

  // Build a warm, human narrative
  let vibe = "";

  if (negativeCount === 0 && positiveCount === total) {
    vibe = `All ${total} review${total === 1 ? "" : "s"} this week ${total === 1 ? "was" : "were"} positive — your customers are loving it! `;
  } else if (positiveCount > negativeCount) {
    vibe = `${positiveCount} out of ${total} reviews this week were positive — great momentum! `;
  } else if (negativeCount > positiveCount) {
    vibe = `A tougher week with ${negativeCount} critical review${negativeCount === 1 ? "" : "s"} — but every piece of feedback is a chance to grow. `;
  } else {
    vibe = `Mixed feedback this week with ${total} review${total === 1 ? "" : "s"} — some wins, some areas to improve. `;
  }

  if (avgRating >= 4.5) {
    vibe += `Your overall ${avgRating.toFixed(1)}-star average is looking great.`;
  } else if (avgRating >= 4.0) {
    vibe += `Your ${avgRating.toFixed(1)}-star average is solid — a few more 5-star reviews will push you higher.`;
  } else if (avgRating >= 3.5) {
    vibe += `Your ${avgRating.toFixed(1)}-star average has room to climb — responding to reviews can help a lot.`;
  } else {
    vibe += `Your ${avgRating.toFixed(1)}-star average needs attention — let's focus on response rate and addressing concerns.`;
  }

  return vibe;
}

// ─── Main Aggregation ────────────────────────────────────────

export function aggregateReviews(
  googleMetrics: { averageRating: number; totalReviews: number; reviews: IndividualReview[] } | null,
  yelpMetrics: { rating: number; reviewCount: number; reviews: IndividualReview[] } | null
): AggregatedReviews {
  const googleReviews = googleMetrics?.reviews || [];
  const yelpReviews = yelpMetrics?.reviews || [];
  const allReviews = [...googleReviews, ...yelpReviews];

  // Sort by date, newest first
  allReviews.sort((a, b) => {
    const dateA = new Date(a.reviewDate || 0).getTime();
    const dateB = new Date(b.reviewDate || 0).getTime();
    return dateB - dateA;
  });

  // Calculate combined average
  const totalRatings =
    (googleMetrics?.averageRating || 0) * (googleMetrics?.totalReviews || 0) +
    (yelpMetrics?.rating || 0) * (yelpMetrics?.reviewCount || 0);
  const totalCount =
    (googleMetrics?.totalReviews || 0) + (yelpMetrics?.reviewCount || 0);
  const combinedAvg = totalCount > 0 ? totalRatings / totalCount : 0;

  // Build platform stats
  const platforms = buildPlatformStats(
    googleMetrics?.averageRating || 0,
    googleMetrics?.totalReviews || 0,
    yelpMetrics?.rating || 0,
    yelpMetrics?.reviewCount || 0,
    googleReviews,
    yelpReviews
  );

  // Extract themes from review text
  const themes = extractThemes(allReviews);

  // Generate weekly vibe
  const weeklyVibe = generateWeeklyVibe(allReviews, combinedAvg);

  return {
    platforms,
    recentReviews: allReviews.slice(0, 20), // keep latest 20
    positiveThemes: themes.positive,
    negativeThemes: themes.negative,
    weeklyVibe,
  };
}
