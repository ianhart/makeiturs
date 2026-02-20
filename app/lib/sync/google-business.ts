/**
 * Google Business Profile Sync
 *
 * Fetches: reviews (with ratings, text, replies), overall rating, direction requests, calls
 * Uses My Business API + Business Profile Performance API.
 *
 * Note: GBP API requires OAuth consent from business owner, or service account
 * with domain-wide delegation. Reviews come from Account Management API.
 */

import type { GoogleBusinessConfig, IndividualReview } from "../types";

const GBP_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const GBP_BUSINESS_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";

export interface GBPMetrics {
  averageRating: number;
  totalReviews: number;
  reviews: IndividualReview[];
  directionRequests?: number;
  phoneCalls?: number;
  websiteClicks?: number;
}

// ─── Auth ────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
  }

  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/business.manage",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const { createSign } = await import("crypto");
  const segments = [
    Buffer.from(JSON.stringify(header)).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
  ];
  const signingInput = segments.join(".");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(sa.private_key, "base64url");
  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google OAuth error: ${await tokenRes.text()}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

// ─── GBP API Types ───────────────────────────────────────────

interface GBPReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

interface GBPReviewsResponse {
  reviews?: GBPReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

// ─── Transform ───────────────────────────────────────────────

const STAR_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function transformReview(review: GBPReview): IndividualReview {
  return {
    platform: "Google",
    externalId: review.reviewId,
    authorName: review.reviewer?.displayName || "Anonymous",
    rating: STAR_MAP[review.starRating] || 5,
    text: review.comment || "",
    replyText: review.reviewReply?.comment || undefined,
    reviewDate: review.createTime,
  };
}

// ─── Main Sync ───────────────────────────────────────────────

export async function syncGoogleBusiness(
  config: GoogleBusinessConfig
): Promise<GBPMetrics> {
  const accessToken = await getAccessToken();
  const locationId = config.location_id;
  const accountId = config.account_id || "";

  // Build the reviews URL
  // Format: accounts/{account_id}/locations/{location_id}/reviews
  const reviewsUrl = accountId
    ? `${GBP_API}/accounts/${accountId}/locations/${locationId}/reviews`
    : `${GBP_BUSINESS_INFO}/${locationId}/reviews`;

  const res = await fetch(`${reviewsUrl}?pageSize=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GBP API ${res.status}: ${text}`);
  }

  const data = (await res.json()) as GBPReviewsResponse;

  const reviews: IndividualReview[] = (data.reviews || []).map(transformReview);

  return {
    averageRating: data.averageRating || 0,
    totalReviews: data.totalReviewCount || reviews.length,
    reviews,
  };
}
