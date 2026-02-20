/**
 * Database seed script for Make It Urs — Brand Command Center
 *
 * Usage:
 *   1. Set DATABASE_URL in .env.local (or export it)
 *   2. npx tsx scripts/seed.ts
 *
 * This will:
 *   - Create the `clients` table if it doesn't exist
 *   - Insert the Gud2Go Cafe demo client with full data
 */

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Export it or add to .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ── helpers ──────────────────────────────────────────────────
function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// ── schema ───────────────────────────────────────────────────
async function createTables() {
  console.log("📦  Creating tables …");
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
  console.log("✅  Tables ready");
}

// ── Gud2Go seed data ─────────────────────────────────────────
async function seedGud2Go() {
  // Check if already seeded
  const existing = await sql`SELECT id FROM clients WHERE slug = 'gud2go' LIMIT 1`;
  if (existing.length > 0) {
    console.log("⏭️   Gud2Go already exists (id=" + existing[0].id + "), skipping.");
    return;
  }

  console.log("🌱  Seeding Gud2Go Cafe …");

  const token = generateToken();

  const brandTheme = {
    primary: "#E8907E",
    primaryLight: "#F5D5CE",
    secondary: "#333333",
    accent: "#C9A84C",
    accentLight: "#DFC478",
    bg: "#FAF7F4",
    cardBg: "#FFFFFF",
    textDark: "#333333",
    muted: "#8A8A8A",
  };

  const metrics = [
    { label: "Google Reviews", value: "4.3/5", target: "4.5+", status: "needs-work" },
    { label: "New Reviews (Feb)", value: "12", target: "15+", status: "needs-work" },
    { label: "Yelp Score", value: "4.0/5", target: "4.5+", status: "needs-work" },
    { label: "DoorDash Rating", value: "4.5/5", target: "4.5+", status: "on-track" },
    { label: "UberEats Rating", value: "4.4/5", target: "4.5+", status: "needs-work" },
    { label: "Response Rate", value: "83%", target: "90%+", status: "needs-work" },
    { label: "Brand Consistency", value: "Compliant", target: "Compliant", status: "on-track" },
    { label: "Social Posts (Week)", value: "2 / 3", target: "3 IG + 2 FB + 1 Google", status: "needs-work" },
  ];

  const requests = [
    { title: "Spring Menu Update — Add 3 new bowls", type: "Menu Update", priority: "high", deadline: "Mar 1", url: "https://app.clickup.com/t/86afhxuqa" },
    { title: "Update Google Business Profile hours", type: "Profile Update", priority: "normal", deadline: "Feb 28", url: "https://app.clickup.com/t/86afhxuqh" },
    { title: "Order-ahead flyer for lunch rush", type: "In-store Signage", priority: "low", deadline: "Mar 1", url: "https://app.clickup.com/t/86afhxuqq" },
  ];

  const campaigns = [
    {
      title: "Spring Menu Drop",
      emoji: "\uD83C\uDF38",
      window: "March 1 \u2013 March 15, 2026",
      status: "active",
      goal: "15% increase in bowl orders",
      progress: 40,
      url: "https://app.clickup.com/t/86afhxur8",
      milestones: [
        { task: "Recipes finalized", due: "Feb 14", status: "done" },
        { task: "Photography shoot (3 new bowls)", due: "Feb 22", status: "in-progress" },
        { task: "All creative assets produced", due: "Feb 26", status: "pending" },
        { task: "Client review + approval", due: "Feb 28", status: "pending" },
        { task: "Launch across all channels", due: "Mar 1", status: "scheduled" },
      ],
    },
    {
      title: "Summer Smoothie Push",
      emoji: "\u2600\uFE0F",
      window: "June 1 \u2013 June 30, 2026",
      status: "planning",
      goal: "20% increase in smoothie orders",
      progress: 5,
      url: "https://app.clickup.com/t/86afhxury",
      milestones: [
        { task: "Campaign concept finalized", due: "Apr 15", status: "pending" },
        { task: "Photography shoot", due: "May 15", status: "pending" },
        { task: "Asset production", due: "May 25", status: "pending" },
        { task: "Launch", due: "Jun 1", status: "pending" },
      ],
    },
  ];

  const assets = [
    { category: "Logos & Brand Marks", icon: "\uD83C\uDFA8", description: "Primary logo, alternates, favicons, social profile pics", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
    { category: "Menu Templates", icon: "\uD83C\uDF7D\uFE0F", description: "Dine-in, takeout, delivery menu layouts", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
    { category: "Photography Library", icon: "\uD83D\uDCF8", description: "Food photography, lifestyle shots, location photos", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
    { category: "Campaign-in-a-Box Kits", icon: "\uD83D\uDCE6", description: "Ready-made seasonal campaign asset packs", canvaUrl: "https://www.canva.com/folder/FAGrVhWqGvk" },
    { category: "Social Media Templates", icon: "\uD83D\uDCF1", description: "Instagram posts, stories, Facebook posts, covers", canvaUrl: "https://www.canva.com/folder/FAGrVhWqGvk" },
  ];

  const huddles = [
    { month: "March 2026", date: "Mar 1", summary: "Spring campaign launch review, summer planning kickoff", url: "https://app.clickup.com/t/86afhxuxd" },
    { month: "February 2026", date: "Feb 1", summary: "Google reviews strategy, social cadence, spring menu planning", url: "https://app.clickup.com/t/86afhxux5" },
  ];

  const socialPosts = [
    { day: "Mon", platform: "Instagram", content: "Acai bowl feature shot", status: "posted" },
    { day: "Wed", platform: "Instagram", content: "Behind the scenes \u2014 smoothie prep", status: "posted" },
    { day: "Fri", platform: "Instagram", content: "Spring menu teaser", status: "scheduled" },
    { day: "Mon", platform: "Facebook", content: "Acai bowl feature", status: "posted" },
    { day: "Thu", platform: "Facebook", content: "Pomona community shoutout", status: "missed" },
  ];

  const reviews = [
    { platform: "Google", rating: "4.3/5", reviewCount: 12, responseRate: "83%" },
    { platform: "Yelp", rating: "4.0/5", reviewCount: 4, responseRate: "75%" },
    { platform: "DoorDash", rating: "4.5/5", reviewCount: 8, responseRate: "N/A" },
    { platform: "UberEats", rating: "4.4/5", reviewCount: 6, responseRate: "N/A" },
  ];

  const positiveThemes = ["Fresh ingredients", "Friendly staff", "Beautiful bowls"];
  const negativeThemes = ["Wait times during lunch rush (2 mentions)"];

  const quickLinks = [
    { label: "ClickUp Command Center", url: "https://app.clickup.com/90131800707/v/f/901317220865", icon: "\uD83D\uDCC1" },
    { label: "Canva Asset Library", url: "https://www.canva.com/folder/FAGrVnD9NPs", icon: "\uD83C\uDFA8" },
    { label: "Submit a Request", url: "https://app.clickup.com/90131800707/v/li/901325593196", icon: "\uD83D\uDCE5" },
    { label: "Brand Health Scorecard", url: "https://app.clickup.com/t/86afhxup5", icon: "\uD83D\uDCCA" },
  ];

  await sql`
    INSERT INTO clients (
      name, slug, portal_token, location, tagline,
      brand_color, brand_theme,
      overall_health, health_summary, top_issue, action_needed, next_huddle,
      metrics, requests, campaigns, assets, huddles,
      social_posts, reviews, positive_themes, negative_themes, quick_links
    ) VALUES (
      ${"Gud2Go Cafe"},
      ${"gud2go"},
      ${token},
      ${"Pomona, CA"},
      ${"Brunch. Grab. Go"},
      ${"#E8907E"},
      ${JSON.stringify(brandTheme)}::jsonb,
      ${"needs-work"},
      ${"Most metrics are close to target but social posting cadence is behind and review response rate needs improvement."},
      ${"Social posting cadence behind target \u2014 missed Friday post"},
      ${"Pre-schedule next 2 weeks of content to get ahead"},
      ${"March 1, 2026"},
      ${JSON.stringify(metrics)}::jsonb,
      ${JSON.stringify(requests)}::jsonb,
      ${JSON.stringify(campaigns)}::jsonb,
      ${JSON.stringify(assets)}::jsonb,
      ${JSON.stringify(huddles)}::jsonb,
      ${JSON.stringify(socialPosts)}::jsonb,
      ${JSON.stringify(reviews)}::jsonb,
      ${JSON.stringify(positiveThemes)}::jsonb,
      ${JSON.stringify(negativeThemes)}::jsonb,
      ${JSON.stringify(quickLinks)}::jsonb
    )
  `;

  console.log("✅  Gud2Go Cafe seeded (portal token: " + token.slice(0, 8) + "…)");
}

// ── main ─────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀  Make It Urs — Database Setup\n");
  try {
    await createTables();
    await seedGud2Go();
    console.log("\n🎉  Done! Run the dev server and visit /admin to manage clients.\n");
  } catch (err) {
    console.error("\n❌  Error:", err);
    process.exit(1);
  }
}

main();
