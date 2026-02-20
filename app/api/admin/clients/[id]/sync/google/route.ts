import { NextResponse } from "next/server";
import { getIntegrationWithConfig, updateSyncStatus } from "@/app/lib/integrations";
import { updateClientSection, updateClientSyncData } from "@/app/lib/db";
import { syncGoogleAnalytics } from "@/app/lib/sync/google-analytics";
import { syncGoogleSearchConsole } from "@/app/lib/sync/google-search-console";
import { syncGoogleBusiness } from "@/app/lib/sync/google-business";
import { aggregateReviews } from "@/app/lib/sync/review-aggregator";
import type {
  GoogleAnalyticsConfig,
  GoogleSearchConsoleConfig,
  GoogleBusinessConfig,
} from "@/app/lib/types";

// POST /api/admin/clients/[id]/sync/google — trigger manual Google sync
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const errors: string[] = [];
    const rawMetrics: Record<string, unknown> = {};

    // ── Google Analytics ──
    const gaIntegration = await getIntegrationWithConfig(clientId, "google_analytics");
    if (gaIntegration?.row.enabled) {
      try {
        const gaData = await syncGoogleAnalytics(
          gaIntegration.config as GoogleAnalyticsConfig
        );
        rawMetrics.analytics = gaData;
        await updateSyncStatus(clientId, "google_analytics", null);
      } catch (err) {
        const msg = `GA sync failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        await updateSyncStatus(clientId, "google_analytics", msg);
      }
    }

    // ── Google Search Console ──
    const gscIntegration = await getIntegrationWithConfig(clientId, "google_search_console");
    if (gscIntegration?.row.enabled) {
      try {
        const gscData = await syncGoogleSearchConsole(
          gscIntegration.config as GoogleSearchConsoleConfig
        );
        rawMetrics.searchConsole = gscData;
        await updateSyncStatus(clientId, "google_search_console", null);
      } catch (err) {
        const msg = `GSC sync failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        await updateSyncStatus(clientId, "google_search_console", msg);
      }
    }

    // ── Google Business Profile (reviews) ──
    let gbpMetrics = null;
    const gbpIntegration = await getIntegrationWithConfig(clientId, "google_business");
    if (gbpIntegration?.row.enabled) {
      try {
        gbpMetrics = await syncGoogleBusiness(
          gbpIntegration.config as GoogleBusinessConfig
        );
        rawMetrics.business = {
          averageRating: gbpMetrics.averageRating,
          totalReviews: gbpMetrics.totalReviews,
        };
        await updateSyncStatus(clientId, "google_business", null);
      } catch (err) {
        const msg = `GBP sync failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        await updateSyncStatus(clientId, "google_business", msg);
      }
    }

    // ── Aggregate reviews (Google only for this route) ──
    if (gbpMetrics) {
      const aggregated = aggregateReviews(gbpMetrics, null);
      await updateClientSection(clientId, "reviews", aggregated.platforms);
      await updateClientSection(clientId, "positive_themes", aggregated.positiveThemes);
      await updateClientSection(clientId, "negative_themes", aggregated.negativeThemes);
      await updateClientSyncData(clientId, {
        recentReviews: aggregated.recentReviews,
        weeklyVibe: aggregated.weeklyVibe,
      });
    }

    // Save raw metrics for humanizer (Phase 4)
    if (Object.keys(rawMetrics).length > 0) {
      await updateClientSyncData(clientId, { rawMetrics });
    }

    return NextResponse.json({
      success: true,
      synced: {
        analytics: !!rawMetrics.analytics,
        searchConsole: !!rawMetrics.searchConsole,
        business: !!rawMetrics.business,
      },
      errors,
    });
  } catch (err) {
    console.error("Google sync error:", err);
    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
