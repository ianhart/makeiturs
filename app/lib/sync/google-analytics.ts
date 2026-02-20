/**
 * Google Analytics 4 Data API Sync
 *
 * Fetches: sessions, average session duration, top pages, users
 * Uses GA4 Data API v1beta with service account credentials.
 *
 * Requires: GOOGLE_SERVICE_ACCOUNT_JSON env var (or stored per-client)
 */

import type { GoogleAnalyticsConfig } from "../types";

const GA4_API = "https://analyticsdata.googleapis.com/v1beta";

interface GA4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

interface GA4Response {
  rows?: GA4Row[];
  totals?: GA4Row[];
  rowCount?: number;
}

export interface GAMetrics {
  sessions: number;
  users: number;
  avgSessionDuration: number; // seconds
  topPages: { page: string; views: number }[];
  bounceRate: number;
  period: string; // e.g. "Last 7 days"
}

// ─── Auth ────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  // Use Google service account JSON from env
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
  }

  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);

  // Create JWT for service account
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // We need to sign with RS256 — use crypto
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

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google OAuth error: ${text}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

// ─── Fetch ───────────────────────────────────────────────────

async function runReport(
  propertyId: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<GA4Response> {
  const res = await fetch(`${GA4_API}/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 API ${res.status}: ${text}`);
  }

  return res.json() as Promise<GA4Response>;
}

// ─── Main Sync ───────────────────────────────────────────────

export async function syncGoogleAnalytics(
  config: GoogleAnalyticsConfig
): Promise<GAMetrics> {
  const accessToken = await getAccessToken();
  const propertyId = config.property_id; // e.g. "properties/123456"

  // 1. Overview metrics for last 7 days
  const overviewReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const overview = overviewReport.rows?.[0]?.metricValues || [];
  const sessions = parseInt(overview[0]?.value || "0", 10);
  const users = parseInt(overview[1]?.value || "0", 10);
  const avgDuration = parseFloat(overview[2]?.value || "0");
  const bounceRate = parseFloat(overview[3]?.value || "0");

  // 2. Top 5 pages by views
  const pagesReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  });

  const topPages = (pagesReport.rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || "/",
    views: parseInt(row.metricValues?.[0]?.value || "0", 10),
  }));

  return {
    sessions,
    users,
    avgSessionDuration: avgDuration,
    topPages,
    bounceRate,
    period: "Last 7 days",
  };
}
