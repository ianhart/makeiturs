/**
 * Yelp Fusion API Sync
 *
 * Fetches: business rating, review count, 3 most recent reviews
 * Yelp API limits: 5,000 calls/day, only returns 3 reviews per call.
 *
 * Requires: YELP_API_KEY env var
 */

import type { YelpConfig, IndividualReview } from "../types";

const YELP_API = "https://api.yelp.com/v3";

export interface YelpMetrics {
  rating: number;
  reviewCount: number;
  reviews: IndividualReview[];
  businessUrl: string;
}

// ─── Yelp API Types ──────────────────────────────────────────

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  url: string;
}

interface YelpReview {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: { name: string };
}

interface YelpReviewsResponse {
  reviews: YelpReview[];
  total: number;
}

// ─── Fetch ───────────────────────────────────────────────────

function getYelpApiKey(): string {
  const key = process.env.YELP_API_KEY;
  if (!key) throw new Error("YELP_API_KEY environment variable is not set");
  return key;
}

async function fetchYelp(endpoint: string): Promise<unknown> {
  const res = await fetch(`${YELP_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${getYelpApiKey()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yelp API ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── Main Sync ───────────────────────────────────────────────

export async function syncYelp(config: YelpConfig): Promise<YelpMetrics> {
  const { business_id } = config;
  if (!business_id) {
    throw new Error("No Yelp business ID configured");
  }

  // 1. Get business details (rating, review count)
  const business = (await fetchYelp(
    `/businesses/${encodeURIComponent(business_id)}`
  )) as YelpBusiness;

  // 2. Get reviews (Yelp only returns up to 3)
  const reviewsData = (await fetchYelp(
    `/businesses/${encodeURIComponent(business_id)}/reviews?limit=3&sort_by=newest`
  )) as YelpReviewsResponse;

  const reviews: IndividualReview[] = reviewsData.reviews.map((r) => ({
    platform: "Yelp",
    externalId: r.id,
    authorName: r.user.name,
    rating: r.rating,
    text: r.text,
    reviewDate: r.time_created,
  }));

  return {
    rating: business.rating,
    reviewCount: business.review_count,
    reviews,
    businessUrl: business.url,
  };
}
