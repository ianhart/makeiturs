/**
 * Sync Orchestrator
 *
 * Coordinates syncing all enabled integrations for a single client.
 * Error isolation: one provider failure doesn't block others.
 */

import {
  getEnabledIntegrations,
  getIntegrationWithConfig,
  updateSyncStatus,
} from "../integrations";
import {
  updateClientSection,
  updateClientSyncData,
  markClientSynced,
  markClientSyncError,
} from "../db";
import { syncClickUp } from "./clickup";
import { syncGoogleAnalytics } from "./google-analytics";
import { syncGoogleSearchConsole } from "./google-search-console";
import { syncGoogleBusiness } from "./google-business";
import { syncYelp } from "./yelp";
import { aggregateReviews } from "./review-aggregator";
import { buildHumanMetrics, generateMetricsNarrative } from "../metrics-humanizer";
import type {
  ClickUpConfig,
  GoogleAnalyticsConfig,
  GoogleSearchConsoleConfig,
  GoogleBusinessConfig,
  YelpConfig,
  IntegrationProvider,
} from "../types";
import type { GAMetrics } from "./google-analytics";
import type { GSCMetrics } from "./google-search-console";

export interface SyncResult {
  clientId: number;
  success: boolean;
  providers: { provider: IntegrationProvider; success: boolean; error?: string }[];
  duration: number;
}

export async function syncClient(clientId: number): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = {
    clientId,
    success: true,
    providers: [],
    duration: 0,
  };

  // Set client to syncing
  await updateClientSyncData(clientId, { syncStatus: "syncing" });

  const integrations = await getEnabledIntegrations(clientId);
  if (integrations.length === 0) {
    result.duration = Date.now() - start;
    return result;
  }

  // Track data for humanizer
  let gaMetrics: GAMetrics | null = null;
  let gscMetrics: GSCMetrics | null = null;
  let gbpData: { averageRating: number; totalReviews: number; reviews: unknown[] } | null = null;
  let yelpData: { rating: number; reviewCount: number; reviews: unknown[] } | null = null;

  for (const integration of integrations) {
    const provider = integration.provider as IntegrationProvider;

    try {
      const withConfig = await getIntegrationWithConfig(clientId, provider);
      if (!withConfig) continue;

      switch (provider) {
        case "clickup": {
          const config = withConfig.config as ClickUpConfig;
          const clickupResult = await syncClickUp(config);

          if (clickupResult.campaigns.length > 0) {
            await updateClientSection(clientId, "campaigns", clickupResult.campaigns);
          }
          if (clickupResult.requests.length > 0) {
            await updateClientSection(clientId, "requests", clickupResult.requests);
          }
          if (clickupResult.socialPosts.length > 0) {
            await updateClientSection(clientId, "social_posts", clickupResult.socialPosts);
          }

          if (clickupResult.errors.length > 0) {
            throw new Error(clickupResult.errors.join("; "));
          }
          break;
        }

        case "google_analytics": {
          gaMetrics = await syncGoogleAnalytics(
            withConfig.config as GoogleAnalyticsConfig
          );
          break;
        }

        case "google_search_console": {
          gscMetrics = await syncGoogleSearchConsole(
            withConfig.config as GoogleSearchConsoleConfig
          );
          break;
        }

        case "google_business": {
          const rawGbp = await syncGoogleBusiness(
            withConfig.config as GoogleBusinessConfig
          );
          gbpData = rawGbp;
          break;
        }

        case "yelp": {
          const rawYelp = await syncYelp(withConfig.config as YelpConfig);
          yelpData = rawYelp;
          break;
        }
      }

      await updateSyncStatus(clientId, provider, null);
      result.providers.push({ provider, success: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await updateSyncStatus(clientId, provider, errorMsg);
      result.providers.push({ provider, success: false, error: errorMsg });
      result.success = false;
    }
  }

  // ── Post-sync: Aggregate reviews ──
  if (gbpData || yelpData) {
    try {
      const aggregated = aggregateReviews(
        gbpData as Parameters<typeof aggregateReviews>[0],
        yelpData as Parameters<typeof aggregateReviews>[1]
      );
      await updateClientSection(clientId, "reviews", aggregated.platforms);
      await updateClientSection(clientId, "positive_themes", aggregated.positiveThemes);
      await updateClientSection(clientId, "negative_themes", aggregated.negativeThemes);
      await updateClientSyncData(clientId, {
        recentReviews: aggregated.recentReviews,
        weeklyVibe: aggregated.weeklyVibe,
      });
    } catch (err) {
      console.error(`[sync] Client ${clientId}: review aggregation failed:`, err);
    }
  }

  // ── Post-sync: Humanize metrics ──
  if (gaMetrics || gscMetrics) {
    try {
      const humanMetrics = buildHumanMetrics(
        gaMetrics,
        gscMetrics,
        gbpData?.averageRating,
        gbpData?.totalReviews,
        yelpData?.rating,
        yelpData?.reviewCount
      );

      if (humanMetrics.length > 0) {
        await updateClientSection(clientId, "metrics", humanMetrics);
      }

      const narrative = generateMetricsNarrative(
        gaMetrics,
        gscMetrics,
        gbpData?.averageRating,
        gbpData?.totalReviews,
        yelpData?.rating,
        yelpData?.reviewCount
      );
      await updateClientSyncData(clientId, {
        metricsNarrative: narrative,
        rawMetrics: {
          analytics: gaMetrics,
          searchConsole: gscMetrics,
          business: gbpData ? { averageRating: gbpData.averageRating, totalReviews: gbpData.totalReviews } : null,
          yelp: yelpData ? { rating: yelpData.rating, reviewCount: yelpData.reviewCount } : null,
        },
      });
    } catch (err) {
      console.error(`[sync] Client ${clientId}: metrics humanization failed:`, err);
    }
  }

  // ── Mark sync complete ──
  if (result.success) {
    await markClientSynced(clientId);
  } else {
    await markClientSyncError(clientId);
  }

  result.duration = Date.now() - start;
  return result;
}
