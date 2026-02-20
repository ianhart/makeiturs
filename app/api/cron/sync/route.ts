import { NextResponse } from "next/server";
import { getClientsWithIntegrations } from "@/app/lib/integrations";
import { syncClient } from "@/app/lib/sync/orchestrator";

/**
 * Vercel Cron Handler — runs every 30 minutes
 * Syncs all clients that have at least one enabled integration.
 *
 * Protected by CRON_SECRET — Vercel sends this as Authorization header.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for cron

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clientIds = await getClientsWithIntegrations();

    if (clientIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No clients with integrations to sync",
      });
    }

    console.log(`[cron] Starting sync for ${clientIds.length} client(s)`);

    // Sync clients sequentially to avoid rate limit issues
    const results = [];
    for (const clientId of clientIds) {
      try {
        const result = await syncClient(clientId);
        results.push(result);
        console.log(
          `[cron] Client ${clientId}: ${result.success ? "success" : "partial"} (${result.duration}ms)`
        );
      } catch (err) {
        console.error(`[cron] Client ${clientId}: fatal error:`, err);
        results.push({
          clientId,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      synced: results.length,
      successful: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (err) {
    console.error("[cron] Fatal sync error:", err);
    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
