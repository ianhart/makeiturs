import { neon } from "@neondatabase/serverless";
import { ClientRow, rowToClientData, ClientData } from "./types";
import { generatePortalToken } from "./tokens";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}

// ─── Portal Queries ──────────────────────────────────────────

export async function getClientByToken(token: string): Promise<ClientData | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM clients WHERE portal_token = ${token} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rowToClientData(rows[0] as unknown as ClientRow);
}

export async function updateLastAccessed(id: number): Promise<void> {
  const sql = getDb();
  await sql`UPDATE clients SET last_accessed_at = NOW() WHERE id = ${id}`;
}

// ─── Admin Queries ───────────────────────────────────────────

export async function getAllClients(): Promise<ClientRow[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, slug, portal_token, location, overall_health,
           updated_at, last_accessed_at, brand_theme
    FROM clients ORDER BY name
  `;
  return rows as unknown as ClientRow[];
}

export async function getClientById(id: number): Promise<ClientRow | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM clients WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return rows[0] as unknown as ClientRow;
}

export interface CreateClientInput {
  name: string;
  slug: string;
  location: string;
  tagline?: string;
  logoUrl?: string;
  brandColor: string;
  brandTheme: Record<string, string>;
  overallHealth?: string;
  healthSummary?: string;
  topIssue?: string;
  actionNeeded?: string;
  nextHuddle?: string;
}

export async function createClient(data: CreateClientInput): Promise<ClientRow> {
  const sql = getDb();
  const token = generatePortalToken();
  const rows = await sql`
    INSERT INTO clients (
      name, slug, portal_token, location, tagline, logo_url,
      brand_color, brand_theme, overall_health, health_summary,
      top_issue, action_needed, next_huddle
    ) VALUES (
      ${data.name}, ${data.slug}, ${token}, ${data.location},
      ${data.tagline || null}, ${data.logoUrl || null},
      ${data.brandColor}, ${JSON.stringify(data.brandTheme)},
      ${data.overallHealth || "on-track"}, ${data.healthSummary || ""},
      ${data.topIssue || ""}, ${data.actionNeeded || ""},
      ${data.nextHuddle || null}
    ) RETURNING *
  `;
  return rows[0] as unknown as ClientRow;
}

export async function updateClient(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    location: string;
    tagline: string | null;
    logo_url: string | null;
    brand_color: string;
    brand_theme: Record<string, string>;
    overall_health: string;
    health_summary: string;
    top_issue: string;
    action_needed: string;
    next_huddle: string | null;
  }>
): Promise<ClientRow | null> {
  const sql = getDb();

  // neon() returns a tagged-template function; we update each field individually
  if (data.name !== undefined) await sql`UPDATE clients SET name = ${data.name}, updated_at = NOW() WHERE id = ${id}`;
  if (data.slug !== undefined) await sql`UPDATE clients SET slug = ${data.slug}, updated_at = NOW() WHERE id = ${id}`;
  if (data.location !== undefined) await sql`UPDATE clients SET location = ${data.location}, updated_at = NOW() WHERE id = ${id}`;
  if (data.tagline !== undefined) await sql`UPDATE clients SET tagline = ${data.tagline}, updated_at = NOW() WHERE id = ${id}`;
  if (data.logo_url !== undefined) await sql`UPDATE clients SET logo_url = ${data.logo_url}, updated_at = NOW() WHERE id = ${id}`;
  if (data.brand_color !== undefined) await sql`UPDATE clients SET brand_color = ${data.brand_color}, updated_at = NOW() WHERE id = ${id}`;
  if (data.brand_theme !== undefined) {
    const themeJson = JSON.stringify(data.brand_theme);
    await sql`UPDATE clients SET brand_theme = ${themeJson}::jsonb, updated_at = NOW() WHERE id = ${id}`;
  }
  if (data.overall_health !== undefined) await sql`UPDATE clients SET overall_health = ${data.overall_health}, updated_at = NOW() WHERE id = ${id}`;
  if (data.health_summary !== undefined) await sql`UPDATE clients SET health_summary = ${data.health_summary}, updated_at = NOW() WHERE id = ${id}`;
  if (data.top_issue !== undefined) await sql`UPDATE clients SET top_issue = ${data.top_issue}, updated_at = NOW() WHERE id = ${id}`;
  if (data.action_needed !== undefined) await sql`UPDATE clients SET action_needed = ${data.action_needed}, updated_at = NOW() WHERE id = ${id}`;
  if (data.next_huddle !== undefined) await sql`UPDATE clients SET next_huddle = ${data.next_huddle}, updated_at = NOW() WHERE id = ${id}`;

  return getClientById(id);
}

export async function deleteClient(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM clients WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// ─── Section Updates (bulk replace) ──────────────────────────

type SectionName =
  | "metrics"
  | "requests"
  | "campaigns"
  | "assets"
  | "huddles"
  | "social_posts"
  | "reviews"
  | "positive_themes"
  | "negative_themes"
  | "quick_links";

export async function updateClientSection(
  id: number,
  section: SectionName,
  data: unknown
): Promise<boolean> {
  const sql = getDb();
  const jsonData = JSON.stringify(data);

  // neon() only supports tagged template literals; use a switch for type safety
  switch (section) {
    case "metrics": await sql`UPDATE clients SET metrics = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "requests": await sql`UPDATE clients SET requests = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "campaigns": await sql`UPDATE clients SET campaigns = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "assets": await sql`UPDATE clients SET assets = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "huddles": await sql`UPDATE clients SET huddles = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "social_posts": await sql`UPDATE clients SET social_posts = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "reviews": await sql`UPDATE clients SET reviews = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "positive_themes": await sql`UPDATE clients SET positive_themes = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "negative_themes": await sql`UPDATE clients SET negative_themes = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
    case "quick_links": await sql`UPDATE clients SET quick_links = ${jsonData}::jsonb, updated_at = NOW() WHERE id = ${id}`; break;
  }
  return true;
}

// ─── Token Management ────────────────────────────────────────

export async function regenerateToken(id: number): Promise<string> {
  const sql = getDb();
  const token = generatePortalToken();
  await sql`
    UPDATE clients SET portal_token = ${token}, updated_at = NOW()
    WHERE id = ${id}
  `;
  return token;
}

// ─── Sync Helpers ───────────────────────────────────────────

export async function updateClientSyncData(
  id: number,
  data: {
    rawMetrics?: Record<string, unknown>;
    metricsNarrative?: string;
    weeklyVibe?: string;
    recentReviews?: unknown[];
    syncStatus?: string;
  }
): Promise<void> {
  const sql = getDb();

  if (data.rawMetrics !== undefined) {
    const json = JSON.stringify(data.rawMetrics);
    await sql`UPDATE clients SET raw_metrics = ${json}::jsonb, updated_at = NOW() WHERE id = ${id}`;
  }
  if (data.metricsNarrative !== undefined) {
    await sql`UPDATE clients SET metrics_narrative = ${data.metricsNarrative}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (data.weeklyVibe !== undefined) {
    await sql`UPDATE clients SET weekly_vibe = ${data.weeklyVibe}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (data.recentReviews !== undefined) {
    const json = JSON.stringify(data.recentReviews);
    await sql`UPDATE clients SET recent_reviews = ${json}::jsonb, updated_at = NOW() WHERE id = ${id}`;
  }
  if (data.syncStatus !== undefined) {
    await sql`UPDATE clients SET sync_status = ${data.syncStatus}, updated_at = NOW() WHERE id = ${id}`;
  }
}

export async function markClientSynced(id: number): Promise<void> {
  const sql = getDb();
  await sql`UPDATE clients SET last_sync_at = NOW(), sync_status = 'success', updated_at = NOW() WHERE id = ${id}`;
}

export async function markClientSyncError(id: number): Promise<void> {
  const sql = getDb();
  await sql`UPDATE clients SET sync_status = 'error', updated_at = NOW() WHERE id = ${id}`;
}

// ─── Database Setup ──────────────────────────────────────────

export async function createTables(): Promise<void> {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id              SERIAL PRIMARY KEY,
      name            TEXT NOT NULL,
      slug            TEXT NOT NULL UNIQUE,
      portal_token    TEXT NOT NULL UNIQUE,
      location        TEXT NOT NULL,
      tagline         TEXT,
      logo_url        TEXT,
      brand_color     TEXT NOT NULL DEFAULT '#333333',
      brand_theme     JSONB NOT NULL DEFAULT '{}',
      overall_health  TEXT NOT NULL DEFAULT 'on-track',
      health_summary  TEXT NOT NULL DEFAULT '',
      top_issue       TEXT NOT NULL DEFAULT '',
      action_needed   TEXT NOT NULL DEFAULT '',
      next_huddle     TEXT,
      metrics         JSONB NOT NULL DEFAULT '[]',
      requests        JSONB NOT NULL DEFAULT '[]',
      campaigns       JSONB NOT NULL DEFAULT '[]',
      assets          JSONB NOT NULL DEFAULT '[]',
      huddles         JSONB NOT NULL DEFAULT '[]',
      social_posts    JSONB NOT NULL DEFAULT '[]',
      reviews         JSONB NOT NULL DEFAULT '[]',
      positive_themes JSONB NOT NULL DEFAULT '[]',
      negative_themes JSONB NOT NULL DEFAULT '[]',
      quick_links     JSONB NOT NULL DEFAULT '[]',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_accessed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_portal_token ON clients(portal_token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug)`;
}
