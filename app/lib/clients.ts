// Client data configuration for Brand Command Center portals
// Add new clients here to create their portal at /client/[slug]

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
  progress: number; // 0-100
  url: string;
  milestones: { task: string; due: string; status: "done" | "in-progress" | "pending" | "scheduled" }[];
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
  primary: string;       // Main brand color (Gud2Go: coral pink)
  primaryLight: string;  // Light variant for backgrounds
  secondary: string;     // Secondary color (Gud2Go: charcoal)
  accent: string;        // Accent color (Gud2Go: gold)
  accentLight: string;   // Light accent for hover states
  bg: string;            // Page background
  cardBg: string;        // Card background
  textDark: string;      // Dark text
  muted: string;         // Muted/secondary text
}

export interface ClientData {
  slug: string;
  name: string;
  location: string;
  tagline?: string;
  logoUrl?: string;
  brandColor: string;
  brandTheme: ClientBrandTheme;
  overallHealth: "on-track" | "needs-work" | "critical";
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
  quickLinks: { label: string; url: string; icon: string }[];
  nextHuddle: string;
}

export const clients: Record<string, ClientData> = {
  "gud2go": {
    slug: "gud2go",
    name: "Gud2Go Cafe",
    location: "Pomona, CA",
    tagline: "Brunch. Grab. Go",
    brandColor: "#E8907E",
    brandTheme: {
      primary: "#E8907E",       // Gud2Go coral pink
      primaryLight: "#F5D5CE",  // Light coral for backgrounds
      secondary: "#333333",     // Charcoal black
      accent: "#C9A84C",        // Gold
      accentLight: "#DFC478",   // Light gold
      bg: "#FAF7F4",            // Warm off-white (paper texture feel)
      cardBg: "#FFFFFF",        // White cards
      textDark: "#333333",      // Charcoal
      muted: "#8A8A8A",         // Gray for secondary text
    },
    overallHealth: "needs-work",
    healthSummary: "Most metrics are close to target but social posting cadence is behind and review response rate needs improvement.",
    topIssue: "Social posting cadence behind target — missed Friday post",
    actionNeeded: "Pre-schedule next 2 weeks of content to get ahead",
    metrics: [
      { label: "Google Reviews", value: "4.3/5", target: "4.5+", status: "needs-work" },
      { label: "New Reviews (Feb)", value: "12", target: "15+", status: "needs-work" },
      { label: "Yelp Score", value: "4.0/5", target: "4.5+", status: "needs-work" },
      { label: "DoorDash Rating", value: "4.5/5", target: "4.5+", status: "on-track" },
      { label: "UberEats Rating", value: "4.4/5", target: "4.5+", status: "needs-work" },
      { label: "Response Rate", value: "83%", target: "90%+", status: "needs-work" },
      { label: "Brand Consistency", value: "Compliant", target: "Compliant", status: "on-track" },
      { label: "Social Posts (Week)", value: "2 / 3", target: "3 IG + 2 FB + 1 Google", status: "needs-work" },
    ],
    requests: [
      { title: "Spring Menu Update — Add 3 new bowls", type: "Menu Update", priority: "high", deadline: "Mar 1", url: "https://app.clickup.com/t/86afhxuqa" },
      { title: "Update Google Business Profile hours", type: "Profile Update", priority: "normal", deadline: "Feb 28", url: "https://app.clickup.com/t/86afhxuqh" },
      { title: "Order-ahead flyer for lunch rush", type: "In-store Signage", priority: "low", deadline: "Mar 1", url: "https://app.clickup.com/t/86afhxuqq" },
    ],
    campaigns: [
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
    ],
    assets: [
      { category: "Logos & Brand Marks", icon: "\uD83C\uDFA8", description: "Primary logo, alternates, favicons, social profile pics", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
      { category: "Menu Templates", icon: "\uD83C\uDF7D\uFE0F", description: "Dine-in, takeout, delivery menu layouts", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
      { category: "Photography Library", icon: "\uD83D\uDCF8", description: "Food photography, lifestyle shots, location photos", canvaUrl: "https://www.canva.com/folder/FAGrVnD9NPs" },
      { category: "Campaign-in-a-Box Kits", icon: "\uD83D\uDCE6", description: "Ready-made seasonal campaign asset packs", canvaUrl: "https://www.canva.com/folder/FAGrVhWqGvk" },
      { category: "Social Media Templates", icon: "\uD83D\uDCF1", description: "Instagram posts, stories, Facebook posts, covers", canvaUrl: "https://www.canva.com/folder/FAGrVhWqGvk" },
    ],
    huddles: [
      { month: "March 2026", date: "Mar 1", summary: "Spring campaign launch review, summer planning kickoff", url: "https://app.clickup.com/t/86afhxuxd" },
      { month: "February 2026", date: "Feb 1", summary: "Google reviews strategy, social cadence, spring menu planning", url: "https://app.clickup.com/t/86afhxux5" },
    ],
    socialPosts: [
      { day: "Mon", platform: "Instagram", content: "Acai bowl feature shot", status: "posted" },
      { day: "Wed", platform: "Instagram", content: "Behind the scenes \u2014 smoothie prep", status: "posted" },
      { day: "Fri", platform: "Instagram", content: "Spring menu teaser", status: "scheduled" },
      { day: "Mon", platform: "Facebook", content: "Acai bowl feature", status: "posted" },
      { day: "Thu", platform: "Facebook", content: "Pomona community shoutout", status: "missed" },
    ],
    reviews: [
      { platform: "Google", rating: "4.3/5", reviewCount: 12, responseRate: "83%" },
      { platform: "Yelp", rating: "4.0/5", reviewCount: 4, responseRate: "75%" },
      { platform: "DoorDash", rating: "4.5/5", reviewCount: 8, responseRate: "N/A" },
      { platform: "UberEats", rating: "4.4/5", reviewCount: 6, responseRate: "N/A" },
    ],
    positiveThemes: ["Fresh ingredients", "Friendly staff", "Beautiful bowls"],
    negativeThemes: ["Wait times during lunch rush (2 mentions)"],
    quickLinks: [
      { label: "ClickUp Command Center", url: "https://app.clickup.com/90131800707/v/f/901317220865", icon: "\uD83D\uDCC1" },
      { label: "Canva Asset Library", url: "https://www.canva.com/folder/FAGrVnD9NPs", icon: "\uD83C\uDFA8" },
      { label: "Submit a Request", url: "https://app.clickup.com/90131800707/v/li/901325593196", icon: "\uD83D\uDCE5" },
      { label: "Brand Health Scorecard", url: "https://app.clickup.com/t/86afhxup5", icon: "\uD83D\uDCCA" },
    ],
    nextHuddle: "March 1, 2026",
  },
};

export function getClient(slug: string): ClientData | undefined {
  return clients[slug];
}

export function getAllClientSlugs(): string[] {
  return Object.keys(clients);
}
