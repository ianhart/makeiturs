/**
 * Migration: Add guest_happiness JSONB column to clients table
 */

import { neon } from "@neondatabase/serverless";

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const sql = neon(url);

  console.log("Adding guest_happiness column to clients table...");

  await sql`
    ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS guest_happiness JSONB
  `;

  console.log("Done! guest_happiness column added.");

  // Verify
  const rows = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'guest_happiness'
  `;
  console.log("Verification:", rows);
}

migrate().catch(console.error);
