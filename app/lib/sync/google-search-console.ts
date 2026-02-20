/**
 * Google Search Console Sync
 *
 * Fetches: clicks, impressions, CTR, average position, top queries
 * Uses Search Console API v1 with service account credentials.
 */

import type { GoogleSearchConsoleConfig } from "../types";

const GSC_API = "https://www.googleapis.com/webmasters/v3";

interface GSCRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCResponse {
  rows?: GSCRow[];
  responseAggregationType?: string;
}

export interface GSCMetrics {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
  topQueries: { query: string; clicks: number; impressions: number }[];
  period: string;
}

// ─── Auth (reuse pattern from GA) ────────────────────────────

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
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
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

// ─── Main Sync ───────────────────────────────────────────────

export async function syncGoogleSearchConsole(
  config: GoogleSearchConsoleConfig
): Promise<GSCMetrics> {
  const accessToken = await getAccessToken();
  const siteUrl = config.site_url;

  // Date range: last 7 days (GSC data has ~3 day lag)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // account for lag
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // 1. Overall metrics
  const overviewRes = await fetch(
    `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: [],
      }),
    }
  );

  if (!overviewRes.ok) {
    throw new Error(`GSC API ${overviewRes.status}: ${await overviewRes.text()}`);
  }

  const overviewData = (await overviewRes.json()) as GSCResponse;
  const totals = overviewData.rows?.[0] || {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };

  // 2. Top queries
  const queriesRes = await fetch(
    `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ["query"],
        rowLimit: 10,
      }),
    }
  );

  if (!queriesRes.ok) {
    throw new Error(`GSC API ${queriesRes.status}: ${await queriesRes.text()}`);
  }

  const queriesData = (await queriesRes.json()) as GSCResponse;
  const topQueries = (queriesData.rows || []).map((row) => ({
    query: row.keys?.[0] || "",
    clicks: row.clicks,
    impressions: row.impressions,
  }));

  return {
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    avgCTR: totals.ctr,
    avgPosition: totals.position,
    topQueries,
    period: `${formatDate(startDate)} to ${formatDate(endDate)}`,
  };
}
