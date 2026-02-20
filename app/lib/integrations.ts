/**
 * CRUD operations for client_integrations table.
 *
 * Integration configs are stored encrypted (AES-256-GCM) in the `config` column.
 * Providers: google_analytics, google_search_console, google_business, yelp, clickup
 */

import { neon } from "@neondatabase/serverless";
import { encryptConfig, decryptConfig } from "./encryption";
import type { IntegrationRow, IntegrationProvider, IntegrationConfig } from "./types";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}

// ─── Read ────────────────────────────────────────────────────

export async function getIntegrationsForClient(
  clientId: number
): Promise<IntegrationRow[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM client_integrations
    WHERE client_id = ${clientId}
    ORDER BY provider
  `;
  return rows as unknown as IntegrationRow[];
}

export async function getIntegration(
  clientId: number,
  provider: IntegrationProvider
): Promise<IntegrationRow | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM client_integrations
    WHERE client_id = ${clientId} AND provider = ${provider}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as IntegrationRow;
}

/**
 * Get integration and decrypt its config. Returns null if not found.
 */
export async function getIntegrationWithConfig(
  clientId: number,
  provider: IntegrationProvider
): Promise<{ row: IntegrationRow; config: IntegrationConfig } | null> {
  const row = await getIntegration(clientId, provider);
  if (!row) return null;

  let config: IntegrationConfig = {};
  if (row.config) {
    try {
      config = decryptConfig(row.config) as IntegrationConfig;
    } catch {
      // Config might be empty string or invalid — return empty
      config = {};
    }
  }
  return { row, config };
}

// ─── Create / Update ─────────────────────────────────────────

export async function upsertIntegration(
  clientId: number,
  provider: IntegrationProvider,
  config: IntegrationConfig,
  enabled: boolean = true
): Promise<IntegrationRow> {
  const sql = getDb();
  const encryptedConfig = encryptConfig(config as Record<string, unknown>);

  const rows = await sql`
    INSERT INTO client_integrations (client_id, provider, config, enabled)
    VALUES (${clientId}, ${provider}, ${encryptedConfig}, ${enabled})
    ON CONFLICT (client_id, provider) DO UPDATE SET
      config = ${encryptedConfig},
      enabled = ${enabled},
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as unknown as IntegrationRow;
}

export async function toggleIntegration(
  clientId: number,
  provider: IntegrationProvider,
  enabled: boolean
): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    UPDATE client_integrations
    SET enabled = ${enabled}, updated_at = NOW()
    WHERE client_id = ${clientId} AND provider = ${provider}
    RETURNING id
  `;
  return result.length > 0;
}

// ─── Sync Status ─────────────────────────────────────────────

export async function updateSyncStatus(
  clientId: number,
  provider: IntegrationProvider,
  error: string | null = null
): Promise<void> {
  const sql = getDb();
  if (error) {
    await sql`
      UPDATE client_integrations
      SET sync_error = ${error}, updated_at = NOW()
      WHERE client_id = ${clientId} AND provider = ${provider}
    `;
  } else {
    await sql`
      UPDATE client_integrations
      SET last_synced_at = NOW(), sync_error = NULL, updated_at = NOW()
      WHERE client_id = ${clientId} AND provider = ${provider}
    `;
  }
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteIntegration(
  clientId: number,
  provider: IntegrationProvider
): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM client_integrations
    WHERE client_id = ${clientId} AND provider = ${provider}
    RETURNING id
  `;
  return result.length > 0;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Get all enabled integrations for a client (for sync orchestration) */
export async function getEnabledIntegrations(
  clientId: number
): Promise<IntegrationRow[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM client_integrations
    WHERE client_id = ${clientId} AND enabled = true
    ORDER BY provider
  `;
  return rows as unknown as IntegrationRow[];
}

/** Get all clients that have at least one enabled integration (for cron) */
export async function getClientsWithIntegrations(): Promise<number[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT DISTINCT client_id FROM client_integrations
    WHERE enabled = true
    ORDER BY client_id
  `;
  return rows.map((r) => (r as unknown as { client_id: number }).client_id);
}
