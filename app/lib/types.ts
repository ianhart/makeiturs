// Shared TypeScript interfaces for Make It Urs Brand Command Center

export interface ClientMetric {
  label: string;
  value: string;
  target: string;
  status: "on-track" | "needs-work" | "critical";
}

export interface ClientRequest {
  title: string;
  type: string;
  priority: "high" | "normal" | "low";
  deadline: string;
  url: string;
}

export interface ClientCampaign {
  title: string;
  emoji: string;
  window: string;
  status: "active" | "planning" | "completed";
  goal: string;
  progress: number;
  url: string;
  milestones: {
    task: string;
    due: string;
    status: "done" | "in-progress" | "pending" | "scheduled";
  }[];
}

export interface ClientAsset {
  category: string;
  icon: string;
  description: string;
  canvaUrl: string;
}

export interface ClientHuddle {
  month: string;
  date: string;
  summary: string;
  url: string;
}

export interface SocialPost {
  day: string;
  platform: string;
  content: string;
  status: "posted" | "scheduled" | "missed";
}

export interface ReviewPlatform {
  platform: string;
  rating: string;
  reviewCount: number;
  responseRate: string;
}

export interface ClientBrandTheme {
  [key: string]: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  accentLight: string;
  bg: string;
  cardBg: string;
  textDark: string;
  muted: string;
}

export type HealthStatus = "on-track" | "needs-work" | "critical";

export interface QuickLink {
  label: string;
  url: string;
  icon: string;
}

// ─── Integration types ──────────────────────────────────────

export type IntegrationProvider =
  | "google_analytics"
  | "google_search_console"
  | "google_business"
  | "yelp"
  | "clickup";

export interface IntegrationRow {
  id: number;
  client_id: number;
  provider: IntegrationProvider;
  config: string; // encrypted JSON
  enabled: boolean;
  last_synced_at: string | null;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Decrypted config shapes per provider */
export interface ClickUpConfig {
  api_token: string;
  workspace_id?: string;
  campaigns_list_id?: string;
  requests_list_id?: string;
  social_list_id?: string;
}

export interface GoogleAnalyticsConfig {
  property_id: string; // GA4 property ID, e.g. "properties/123456"
  // Service account credentials stored at env level
}

export interface GoogleSearchConsoleConfig {
  site_url: string; // e.g. "https://gud2gocafe.com"
}

export interface GoogleBusinessConfig {
  location_id: string; // GBP location, e.g. "locations/123456"
  account_id?: string;
}

export interface YelpConfig {
  business_id: string; // Yelp business alias or ID
}

export type IntegrationConfig =
  | ClickUpConfig
  | GoogleAnalyticsConfig
  | GoogleSearchConsoleConfig
  | GoogleBusinessConfig
  | YelpConfig
  | Record<string, unknown>;

// ─── Individual review (from Google / Yelp) ─────────────────

export interface IndividualReview {
  id?: number;
  platform: string;
  externalId?: string;
  authorName: string;
  rating: number; // 1-5
  text: string;
  replyText?: string;
  reviewDate: string;
}

// ─── Sync status ─────────────────────────────────────────────

export type SyncStatus = "idle" | "syncing" | "success" | "error";

// Database row shape (what comes back from Postgres)
export interface ClientRow {
  id: number;
  name: string;
  slug: string;
  portal_token: string;
  location: string;
  tagline: string | null;
  logo_url: string | null;
  brand_color: string;
  brand_theme: ClientBrandTheme;
  overall_health: HealthStatus;
  health_summary: string;
  top_issue: string;
  action_needed: string;
  next_huddle: string | null;
  metrics: ClientMetric[];
  requests: ClientRequest[];
  campaigns: ClientCampaign[];
  assets: ClientAsset[];
  huddles: ClientHuddle[];
  social_posts: SocialPost[];
  reviews: ReviewPlatform[];
  positive_themes: string[];
  negative_themes: string[];
  quick_links: QuickLink[];
  // Sync fields (Phase 1)
  raw_metrics?: Record<string, unknown>;
  metrics_narrative?: string;
  weekly_vibe?: string;
  recent_reviews?: IndividualReview[];
  last_sync_at?: string | null;
  sync_status?: SyncStatus;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
}

// Transformed client data for portal components (matches what components expect)
export interface ClientData {
  id: number;
  slug: string;
  name: string;
  location: string;
  tagline?: string;
  logoUrl?: string;
  brandColor: string;
  brandTheme: ClientBrandTheme;
  overallHealth: HealthStatus;
  healthSummary: string;
  topIssue: string;
  actionNeeded: string;
  metrics: ClientMetric[];
  requests: ClientRequest[];
  campaigns: ClientCampaign[];
  assets: ClientAsset[];
  huddles: ClientHuddle[];
  socialPosts: SocialPost[];
  reviews: ReviewPlatform[];
  positiveThemes: string[];
  negativeThemes: string[];
  quickLinks: QuickLink[];
  nextHuddle: string;
  portalToken: string;
  // Sync fields (Phase 1)
  metricsNarrative?: string;
  weeklyVibe?: string;
  recentReviews?: IndividualReview[];
  lastSyncAt?: string;
  syncStatus?: SyncStatus;
}

// Transform database row to component-friendly format
export function rowToClientData(row: ClientRow): ClientData {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    tagline: row.tagline || undefined,
    logoUrl: row.logo_url || undefined,
    brandColor: row.brand_color,
    brandTheme: row.brand_theme,
    overallHealth: row.overall_health,
    healthSummary: row.health_summary,
    topIssue: row.top_issue,
    actionNeeded: row.action_needed,
    metrics: row.metrics,
    requests: row.requests,
    campaigns: row.campaigns,
    assets: row.assets,
    huddles: row.huddles,
    socialPosts: row.social_posts,
    reviews: row.reviews,
    positiveThemes: row.positive_themes,
    negativeThemes: row.negative_themes,
    quickLinks: row.quick_links,
    nextHuddle: row.next_huddle || "",
    portalToken: row.portal_token,
    // Sync fields
    metricsNarrative: row.metrics_narrative || undefined,
    weeklyVibe: row.weekly_vibe || undefined,
    recentReviews: row.recent_reviews || undefined,
    lastSyncAt: row.last_sync_at || undefined,
    syncStatus: row.sync_status || undefined,
  };
}
