import { NextResponse } from "next/server";
import { getIntegrationWithConfig, updateSyncStatus } from "@/app/lib/integrations";
import { updateClientSection, updateClientSyncData } from "@/app/lib/db";
import { syncYelp } from "@/app/lib/sync/yelp";
import { aggregateReviews } from "@/app/lib/sync/review-aggregator";
import type { YelpConfig } from "@/app/lib/types";

// POST /api/admin/clients/[id]/sync/yelp — trigger manual Yelp sync
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

    const yelpIntegration = await getIntegrationWithConfig(clientId, "yelp");
    if (!yelpIntegration) {
      return NextResponse.json(
        { error: "No Yelp integration configured for this client" },
        { status: 404 }
      );
    }
    if (!yelpIntegration.row.enabled) {
      return NextResponse.json(
        { error: "Yelp integration is disabled" },
        { status: 400 }
      );
    }

    const config = yelpIntegration.config as YelpConfig;

    // Run sync
    const yelpData = await syncYelp(config);
    await updateSyncStatus(clientId, "yelp", null);

    // Aggregate reviews (Yelp only for this route)
    const aggregated = aggregateReviews(null, yelpData);

    // Note: This only updates Yelp data — a full sync would combine with Google
    // For now, merge: get existing reviews and append Yelp
    await updateClientSection(clientId, "reviews", aggregated.platforms);
    await updateClientSyncData(clientId, {
      recentReviews: aggregated.recentReviews,
      weeklyVibe: aggregated.weeklyVibe,
    });
    await updateClientSection(clientId, "positive_themes", aggregated.positiveThemes);
    await updateClientSection(clientId, "negative_themes", aggregated.negativeThemes);

    return NextResponse.json({
      success: true,
      synced: {
        rating: yelpData.rating,
        reviewCount: yelpData.reviewCount,
        reviewsFetched: yelpData.reviews.length,
      },
    });
  } catch (err) {
    console.error("Yelp sync error:", err);

    // Update sync status with error
    try {
      const { id } = await params;
      const clientId = parseInt(id, 10);
      if (!isNaN(clientId)) {
        await updateSyncStatus(
          clientId,
          "yelp",
          err instanceof Error ? err.message : String(err)
        );
      }
    } catch {
      // Ignore nested error
    }

    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
