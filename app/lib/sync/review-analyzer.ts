/**
 * AI Review Analyzer
 *
 * Uses OpenRouter (google/gemini-flash-1.5) to analyze review data and produce:
 *   1. Recent Review Sentiment — warm, human summary of what people are saying
 *   2. Top Mentioned Menu Items — popular dishes/items extracted from reviews
 *   3. Response Time to Complaints — how quickly the team replies (from GBP owner replies)
 *
 * Falls back gracefully when review text is unavailable (Yelp deprecated, GBP quota=0).
 */

import type { IndividualReview, ReviewPlatform } from "../types";

// ─── Types ──────────────────────────────────────────────────

export interface GuestHappinessData {
  sentiment: {
    summary: string; // warm, 2-3 sentence narrative
    positivePercent: number; // e.g. 85
    negativePercent: number; // e.g. 15
    topPraises: string[]; // e.g. ["Fresh smoothies", "Friendly staff"]
    topComplaints: string[]; // e.g. ["Slow service during lunch rush"]
  };
  menuMentions: {
    items: { name: string; mentions: number; sentiment: "positive" | "mixed" | "negative" }[];
  };
  responseTime: {
    summary: string; // e.g. "You reply within 2 days on average — nice!"
    avgHours: number | null; // null if no reply data
    repliedCount: number;
    totalNegative: number;
  };
  analyzedAt: string; // ISO timestamp
  reviewsAnalyzed: number;
}

// ─── OpenRouter Client ──────────────────────────────────────

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-flash-1.5";

function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY environment variable is not set");
  return key;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const res = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://makeiturs.com",
      "X-Title": "Make It Urs Portal",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a warm, friendly marketing analytics assistant. You analyze customer reviews for small business owners. Always respond in valid JSON. No markdown, no code fences, just pure JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  return content.trim();
}

// ─── Response Time Calculator ───────────────────────────────

function calculateResponseTime(reviews: IndividualReview[]): {
  summary: string;
  avgHours: number | null;
  repliedCount: number;
  totalNegative: number;
} {
  // Only reviews with rating <= 3 are "complaints" worth tracking response time for
  const negativeReviews = reviews.filter((r) => r.rating <= 3);
  const totalNegative = negativeReviews.length;

  // Count reviews that got owner replies
  const repliedReviews = negativeReviews.filter((r) => r.replyText);
  const repliedCount = repliedReviews.length;

  if (totalNegative === 0) {
    return {
      summary: "No critical reviews to respond to — your customers are happy!",
      avgHours: null,
      repliedCount: 0,
      totalNegative: 0,
    };
  }

  if (repliedCount === 0) {
    return {
      summary: `${totalNegative} review${totalNegative === 1 ? " needs" : "s need"} a response — replying shows you care!`,
      avgHours: null,
      repliedCount: 0,
      totalNegative,
    };
  }

  const responseRate = Math.round((repliedCount / totalNegative) * 100);

  if (responseRate >= 80) {
    return {
      summary: `You've replied to ${repliedCount} of ${totalNegative} critical reviews (${responseRate}%) — great responsiveness!`,
      avgHours: null, // We don't have timestamps for reply time from current API data
      repliedCount,
      totalNegative,
    };
  } else {
    return {
      summary: `You've replied to ${repliedCount} of ${totalNegative} critical reviews (${responseRate}%) — responding to the rest could help turn things around.`,
      avgHours: null,
      repliedCount,
      totalNegative,
    };
  }
}

// ─── AI Sentiment Analysis ──────────────────────────────────

async function analyzeSentimentWithAI(
  reviews: IndividualReview[],
  platforms: ReviewPlatform[]
): Promise<{
  summary: string;
  positivePercent: number;
  negativePercent: number;
  topPraises: string[];
  topComplaints: string[];
  menuItems: { name: string; mentions: number; sentiment: "positive" | "mixed" | "negative" }[];
}> {
  // If we have actual review text, use AI
  const reviewsWithText = reviews.filter((r) => r.text && r.text.length > 5);

  if (reviewsWithText.length > 0) {
    // Build review digest for the AI (limit to latest 20 to stay within token limits)
    const reviewDigest = reviewsWithText.slice(0, 20).map((r) => ({
      rating: r.rating,
      text: r.text.slice(0, 300), // truncate long reviews
      platform: r.platform,
    }));

    const prompt = `Analyze these ${reviewDigest.length} customer reviews for a cafe/restaurant and respond with ONLY valid JSON (no markdown, no code fences):

Reviews:
${JSON.stringify(reviewDigest)}

Return this exact JSON structure:
{
  "summary": "A warm 2-3 sentence summary of what customers are saying. Write like you're talking to the business owner — friendly, encouraging, specific.",
  "positivePercent": 85,
  "negativePercent": 15,
  "topPraises": ["Specific praise 1", "Specific praise 2", "Specific praise 3"],
  "topComplaints": ["Specific complaint 1"],
  "menuItems": [
    {"name": "Item Name", "mentions": 3, "sentiment": "positive"},
    {"name": "Another Item", "mentions": 2, "sentiment": "mixed"}
  ]
}

Rules:
- menuItems: Extract specific food/drink items mentioned. If none mentioned, return empty array.
- topPraises/topComplaints: Be specific (e.g. "Fresh smoothies" not just "Food quality")
- positivePercent + negativePercent should equal 100
- summary: Be warm and encouraging, mention specific highlights`;

    try {
      const raw = await callOpenRouter(prompt);
      // Clean potential markdown fences
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        summary: parsed.summary || "Your customers have been sharing their thoughts!",
        positivePercent: Math.min(100, Math.max(0, parsed.positivePercent || 80)),
        negativePercent: Math.min(100, Math.max(0, parsed.negativePercent || 20)),
        topPraises: Array.isArray(parsed.topPraises) ? parsed.topPraises.slice(0, 5) : [],
        topComplaints: Array.isArray(parsed.topComplaints) ? parsed.topComplaints.slice(0, 5) : [],
        menuItems: Array.isArray(parsed.menuItems)
          ? parsed.menuItems.slice(0, 8).map((item: { name: string; mentions: number; sentiment: string }) => ({
              name: item.name || "Unknown",
              mentions: item.mentions || 1,
              sentiment: (["positive", "mixed", "negative"].includes(item.sentiment) ? item.sentiment : "positive") as "positive" | "mixed" | "negative",
            }))
          : [],
      };
    } catch (err) {
      console.error("[review-analyzer] AI analysis failed, falling back to stats:", err);
      // Fall through to stats-based analysis
    }
  }

  // Fallback: generate from aggregate stats when we don't have review text
  return generateFromStats(reviews, platforms);
}

// ─── Stats-Based Fallback ───────────────────────────────────

function generateFromStats(
  reviews: IndividualReview[],
  platforms: ReviewPlatform[]
): {
  summary: string;
  positivePercent: number;
  negativePercent: number;
  topPraises: string[];
  topComplaints: string[];
  menuItems: { name: string; mentions: number; sentiment: "positive" | "mixed" | "negative" }[];
} {
  // Use platform ratings to estimate sentiment
  const totalReviews = platforms.reduce((sum, p) => sum + p.reviewCount, 0);
  const weightedRating = platforms.reduce((sum, p) => {
    const rating = parseFloat(p.rating.replace("/5", ""));
    return sum + rating * p.reviewCount;
  }, 0);
  const avgRating = totalReviews > 0 ? weightedRating / totalReviews : 0;

  // Estimate positive/negative split from rating
  const positivePercent = Math.round(Math.min(100, Math.max(0, (avgRating / 5) * 100)));
  const negativePercent = 100 - positivePercent;

  let summary = "";
  if (avgRating >= 4.5) {
    summary = `Your customers love you! Across ${totalReviews} reviews on ${platforms.length} platform${platforms.length !== 1 ? "s" : ""}, you're sitting at ${avgRating.toFixed(1)} stars. That's seriously impressive — keep doing what you're doing.`;
  } else if (avgRating >= 4.0) {
    summary = `Solid reputation with ${avgRating.toFixed(1)} stars across ${totalReviews} reviews. Your customers are generally happy — a few more 5-star experiences could push you even higher.`;
  } else if (avgRating >= 3.5) {
    summary = `You've got ${totalReviews} reviews averaging ${avgRating.toFixed(1)} stars — room to grow! Focusing on the feedback could help turn those 3-star experiences into 5-star ones.`;
  } else {
    summary = `With ${totalReviews} reviews averaging ${avgRating.toFixed(1)} stars, there's real opportunity to improve. Let's focus on addressing customer concerns and building momentum.`;
  }

  // Use keyword-based themes from actual reviews if available
  const positiveKeywords = reviews.filter((r) => r.rating >= 4).length;
  const topPraises = positiveKeywords > 0
    ? ["Consistent quality", "Friendly experience"]
    : ["Building a loyal customer base"];
  const topComplaints = reviews.filter((r) => r.rating <= 2).length > 0
    ? ["Some experiences fell short"]
    : [];

  return {
    summary,
    positivePercent,
    negativePercent,
    topPraises,
    topComplaints,
    menuItems: [], // Can't extract menu items without review text
  };
}

// ─── Main Analyzer ──────────────────────────────────────────

export async function analyzeReviews(
  reviews: IndividualReview[],
  platforms: ReviewPlatform[]
): Promise<GuestHappinessData> {
  // Run sentiment/menu analysis (AI or fallback)
  const analysis = await analyzeSentimentWithAI(reviews, platforms);

  // Calculate response time from review data
  const responseTime = calculateResponseTime(reviews);

  return {
    sentiment: {
      summary: analysis.summary,
      positivePercent: analysis.positivePercent,
      negativePercent: analysis.negativePercent,
      topPraises: analysis.topPraises,
      topComplaints: analysis.topComplaints,
    },
    menuMentions: {
      items: analysis.menuItems,
    },
    responseTime,
    analyzedAt: new Date().toISOString(),
    reviewsAnalyzed: reviews.length,
  };
}
