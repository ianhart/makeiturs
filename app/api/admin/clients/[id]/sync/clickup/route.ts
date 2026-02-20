import { NextResponse } from "next/server";
import { getIntegrationWithConfig, updateSyncStatus } from "@/app/lib/integrations";
import { updateClientSection } from "@/app/lib/db";
import { syncClickUp } from "@/app/lib/sync/clickup";
import type { ClickUpConfig } from "@/app/lib/types";

// POST /api/admin/clients/[id]/sync/clickup — trigger manual ClickUp sync
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

    // Get ClickUp integration config
    const integration = await getIntegrationWithConfig(clientId, "clickup");
    if (!integration) {
      return NextResponse.json(
        { error: "No ClickUp integration configured for this client" },
        { status: 404 }
      );
    }
    if (!integration.row.enabled) {
      return NextResponse.json(
        { error: "ClickUp integration is disabled" },
        { status: 400 }
      );
    }

    const config = integration.config as ClickUpConfig;

    // Run sync
    const result = await syncClickUp(config);

    // Save results to DB
    if (result.campaigns.length > 0) {
      await updateClientSection(clientId, "campaigns", result.campaigns);
    }
    if (result.requests.length > 0) {
      await updateClientSection(clientId, "requests", result.requests);
    }
    if (result.socialPosts.length > 0) {
      await updateClientSection(clientId, "social_posts", result.socialPosts);
    }

    // Update sync status
    if (result.errors.length > 0) {
      await updateSyncStatus(clientId, "clickup", result.errors.join("; "));
    } else {
      await updateSyncStatus(clientId, "clickup", null);
    }

    return NextResponse.json({
      success: true,
      synced: {
        campaigns: result.campaigns.length,
        requests: result.requests.length,
        socialPosts: result.socialPosts.length,
      },
      errors: result.errors,
    });
  } catch (err) {
    console.error("ClickUp sync error:", err);
    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
