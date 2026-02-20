/**
 * Database migration: Add integrations + reviews tables + sync columns
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-integrations.ts
 *
 * Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Export it or add to .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("\n🔄  Running integrations migration …\n");

  // ── 1. client_integrations table ──────────────────────────────
  console.log("📦  Creating client_integrations table …");
  await sql`
    CREATE TABLE IF NOT EXISTS client_integrations (
      id              SERIAL PRIMARY KEY,
      client_id       INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      provider        TEXT NOT NULL,
      config          TEXT NOT NULL DEFAULT '',
      enabled         BOOLEAN NOT NULL DEFAULT true,
      last_synced_at  TIMESTAMPTZ,
      sync_error      TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, provider)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_integrations_client ON client_integrations(client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_integrations_provider ON client_integrations(provider)`;
  console.log("✅  client_integrations ready");

  // ── 2. client_reviews_detail table ────────────────────────────
  console.log("📦  Creating client_reviews_detail table …");
  await sql`
    CREATE TABLE IF NOT EXISTS client_reviews_detail (
      id              SERIAL PRIMARY KEY,
      client_id       INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      platform        TEXT NOT NULL,
      external_id     TEXT,
      author_name     TEXT NOT NULL DEFAULT 'Anonymous',
      rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      text            TEXT NOT NULL DEFAULT '',
      reply_text      TEXT,
      review_date     TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, platform, external_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_client ON client_reviews_detail(client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_platform ON client_reviews_detail(client_id, platform)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_date ON client_reviews_detail(client_id, review_date DESC)`;
  console.log("✅  client_reviews_detail ready");

  // ── 3. New columns on clients table ───────────────────────────
  console.log("📦  Adding sync columns to clients …");

  // neon() only supports tagged templates — each ALTER TABLE is its own call
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS raw_metrics JSONB DEFAULT '{}'::jsonb`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS metrics_narrative TEXT DEFAULT ''`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS weekly_vibe TEXT DEFAULT ''`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS recent_reviews JSONB DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle'`;

  console.log("✅  Sync columns added");

  console.log("\n🎉  Migration complete!\n");
}

migrate().catch((err) => {
  console.error("\n❌  Migration error:", err);
  process.exit(1);
});
