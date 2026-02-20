import { NextResponse } from "next/server";
import {
  getIntegrationsForClient,
  upsertIntegration,
  deleteIntegration,
  toggleIntegration,
} from "@/app/lib/integrations";
import { decryptConfig } from "@/app/lib/encryption";
import type { IntegrationProvider } from "@/app/lib/types";

// Mask sensitive fields in config before sending to client
function maskConfig(encrypted: string): Record<string, unknown> {
  try {
    const config = decryptConfig(encrypted);
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(config)) {
      if (
        key.includes("token") ||
        key.includes("secret") ||
        key.includes("key") ||
        key.includes("password")
      ) {
        const str = String(value);
        masked[key] = str.length > 8 ? str.slice(0, 4) + "••••" + str.slice(-4) : "••••••••";
      } else {
        masked[key] = value;
      }
    }
    return masked;
  } catch {
    return {};
  }
}

const VALID_PROVIDERS: IntegrationProvider[] = [
  "google_analytics",
  "google_search_console",
  "google_business",
  "yelp",
  "clickup",
];

// GET /api/admin/clients/[id]/integrations
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const rows = await getIntegrationsForClient(clientId);

    // Return integrations with masked configs
    const integrations = rows.map((row) => ({
      id: row.id,
      provider: row.provider,
      enabled: row.enabled,
      config: maskConfig(row.config),
      lastSyncedAt: row.last_synced_at,
      syncError: row.sync_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ integrations });
  } catch (err) {
    console.error("GET integrations error:", err);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}

// POST /api/admin/clients/[id]/integrations
// Body: { provider, config, enabled? } — creates or updates an integration
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();
    const { provider, config, enabled } = body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Config must be a JSON object" }, { status: 400 });
    }

    const row = await upsertIntegration(
      clientId,
      provider as IntegrationProvider,
      config,
      enabled !== false
    );

    return NextResponse.json({
      integration: {
        id: row.id,
        provider: row.provider,
        enabled: row.enabled,
        config: maskConfig(row.config),
        lastSyncedAt: row.last_synced_at,
        syncError: row.sync_error,
      },
    });
  } catch (err) {
    console.error("POST integration error:", err);
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }
}

// DELETE /api/admin/clients/[id]/integrations
// Body: { provider }
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const deleted = await deleteIntegration(clientId, provider as IntegrationProvider);
    if (!deleted) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE integration error:", err);
    return NextResponse.json({ error: "Failed to delete integration" }, { status: 500 });
  }
}

// PATCH /api/admin/clients/[id]/integrations
// Body: { provider, enabled }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();
    const { provider, enabled } = body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
    }

    const updated = await toggleIntegration(clientId, provider as IntegrationProvider, enabled);
    if (!updated) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH integration error:", err);
    return NextResponse.json({ error: "Failed to update integration" }, { status: 500 });
  }
}
