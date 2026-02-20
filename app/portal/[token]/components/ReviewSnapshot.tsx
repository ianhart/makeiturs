import { ReviewPlatform, IndividualReview, ClientBrandTheme } from "@/app/lib/types";

// Star rating display
function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`${size} leading-none`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ color: star <= rating ? "#FBBF24" : "#E5E7EB" }}
        >
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

// Platform badge
function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Google: { bg: "#E8F0FE", text: "#1A73E8" },
    Yelp: { bg: "#FEE2E2", text: "#D32323" },
    DoorDash: { bg: "#FFF3E0", text: "#FF3008" },
    UberEats: { bg: "#E8F5E9", text: "#276E39" },
  };
  const c = colors[platform] || { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {platform}
    </span>
  );
}

function formatReviewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewSnapshot({
  reviews,
  positiveThemes,
  negativeThemes,
  weeklyVibe,
  recentReviews,
  theme,
}: {
  reviews: ReviewPlatform[];
  positiveThemes: string[];
  negativeThemes: string[];
  weeklyVibe?: string;
  recentReviews?: IndividualReview[];
  theme: ClientBrandTheme;
}) {
  return (
    <section
      className="rounded-xl p-5 border"
      style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}
    >
      <h2
        className="text-lg font-bold mb-4 flex items-center gap-2"
        style={{ color: theme.secondary }}
      >
        <span>{"\u2B50"}</span> Reviews & Reputation
      </h2>

      {/* Weekly vibe banner */}
      {weeklyVibe && (
        <div
          className="rounded-xl p-4 mb-4 text-sm leading-relaxed border"
          style={{
            backgroundColor: "#FFF7ED",
            borderColor: "#FDBA74",
            color: theme.textDark,
          }}
        >
          <span className="font-semibold">{"\u2728"} This week&apos;s vibe:</span>{" "}
          {weeklyVibe}
        </div>
      )}

      {/* Platform summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {reviews.map((r) => (
          <div
            key={r.platform}
            className="rounded-lg p-3 border text-center"
            style={{ borderColor: "#E2E8F0" }}
          >
            <PlatformBadge platform={r.platform} />
            <p
              className="text-xl font-bold mt-2"
              style={{ color: theme.primary }}
            >
              {r.rating}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.muted }}>
              {r.reviewCount} review{r.reviewCount !== 1 ? "s" : ""}
            </p>
            {r.responseRate !== "N/A" && (
              <p className="text-xs" style={{ color: theme.muted }}>
                {r.responseRate} responded
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Individual reviews */}
      {recentReviews && recentReviews.length > 0 && (
        <div className="mb-4">
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wide"
            style={{ color: theme.muted }}
          >
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {recentReviews.slice(0, 6).map((review, idx) => (
              <div
                key={review.externalId || `review-${idx}`}
                className="rounded-lg p-4 border"
                style={{ borderColor: "#E2E8F0", backgroundColor: "#FAFAFA" }}
              >
                {/* Header: author, stars, platform, date */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: theme.secondary }}
                    >
                      {review.authorName}
                    </span>
                    <Stars rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={review.platform} />
                    {review.reviewDate && (
                      <span
                        className="text-xs"
                        style={{ color: theme.muted }}
                      >
                        {formatReviewDate(review.reviewDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review text */}
                {review.text && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: theme.textDark }}
                  >
                    &ldquo;{review.text}&rdquo;
                  </p>
                )}

                {/* Owner reply */}
                {review.replyText && (
                  <div
                    className="mt-2 pl-3 border-l-2 text-sm"
                    style={{
                      borderColor: theme.primary,
                      color: theme.muted,
                    }}
                  >
                    <span className="font-medium" style={{ color: theme.secondary }}>
                      Owner reply:
                    </span>{" "}
                    {review.replyText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Themes */}
      <div className="space-y-2">
        {positiveThemes.length > 0 && (
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#059669" }}
            >
              {"\uD83D\uDC4D"} What customers love
            </span>
            <p className="text-sm mt-0.5" style={{ color: theme.muted }}>
              {positiveThemes.join(" \u2022 ")}
            </p>
          </div>
        )}
        {negativeThemes.length > 0 && (
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#DC2626" }}
            >
              {"\uD83D\uDC4E"} Areas to improve
            </span>
            <p className="text-sm mt-0.5" style={{ color: theme.muted }}>
              {negativeThemes.join(" \u2022 ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
