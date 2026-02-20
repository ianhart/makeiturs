import { NextResponse } from "next/server";
import { getClientByToken } from "@/app/lib/db";
import { getEnabledIntegrations } from "@/app/lib/integrations";
import { syncClient } from "@/app/lib/sync/orchestrator";

/**
 * Background Refresh Endpoint
 *
 * Called by the portal page when cached data is stale (>15 min).
 * Triggers a non-blocking sync and returns immediately.
 *
 * This endpoint does NOT require auth — it's accessed by the portal iframe.
 * Security: only accepts valid portal tokens (same auth as the portal itself).
 */

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const client = await getClientByToken(token);

    if (!client) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    // Check if client has any integrations
    const integrations = await getEnabledIntegrations(client.id);
    if (integrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No integrations to sync",
      });
    }

    // Check if data is actually stale (>15 min since last sync)
    const lastSync = client.lastSyncAt
      ? new Date(client.lastSyncAt).getTime()
      : 0;
    const staleThreshold = 15 * 60 * 1000; // 15 minutes
    const isStale = Date.now() - lastSync > staleThreshold;

    if (!isStale) {
      return NextResponse.json({
        success: true,
        message: "Data is fresh, no sync needed",
      });
    }

    // Trigger sync (non-blocking — we don't await the full result)
    // In Edge runtime we can't do fire-and-forget, so we sync and return
    const result = await syncClient(client.id);

    return NextResponse.json({
      success: result.success,
      synced: result.providers.length,
      duration: result.duration,
    });
  } catch (err) {
    console.error("Portal refresh error:", err);
    return NextResponse.json(
      { error: "Refresh failed" },
      { status: 500 }
    );
  }
}
