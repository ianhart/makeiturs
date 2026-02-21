import type { GuestHappinessData, ClientBrandTheme } from "@/app/lib/types";

// ─── Sentiment Bar ──────────────────────────────────────────

function SentimentBar({
  positivePercent,
  theme,
}: {
  positivePercent: number;
  theme: ClientBrandTheme;
}) {
  const negativePercent = 100 - positivePercent;
  return (
    <div className="mt-3 mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: "#059669" }} className="font-medium">
          {"\uD83D\uDE0A"} {positivePercent}% positive
        </span>
        <span style={{ color: "#DC2626" }} className="font-medium">
          {negativePercent}% needs attention {"\uD83D\uDE15"}
        </span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden flex"
        style={{ backgroundColor: "#E5E7EB" }}
      >
        <div
          className="h-full rounded-l-full transition-all duration-700"
          style={{
            width: `${positivePercent}%`,
            background: `linear-gradient(90deg, #059669, ${theme.primary})`,
          }}
        />
        {negativePercent > 0 && (
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${negativePercent}%`,
              backgroundColor: "#FCA5A5",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Menu Item Pill ─────────────────────────────────────────

function MenuItemPill({
  name,
  mentions,
  sentiment,
  theme,
}: {
  name: string;
  mentions: number;
  sentiment: "positive" | "mixed" | "negative";
  theme: ClientBrandTheme;
}) {
  const sentimentConfig = {
    positive: { bg: "#ECFDF5", text: "#059669", emoji: "\uD83D\uDC9A" },
    mixed: { bg: "#FFF7ED", text: "#D97706", emoji: "\uD83D\uDFE1" },
    negative: { bg: "#FEF2F2", text: "#DC2626", emoji: "\uD83D\uDD34" },
  };
  const config = sentimentConfig[sentiment];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span>{config.emoji}</span>
      <span>{name}</span>
      {mentions > 1 && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: sentiment === "positive" ? theme.primaryLight : config.bg,
            color: config.text,
            opacity: 0.8,
          }}
        >
          {mentions}x
        </span>
      )}
    </div>
  );
}

// ─── Response Time Card ─────────────────────────────────────

function ResponseTimeCard({
  responseTime,
  theme,
}: {
  responseTime: GuestHappinessData["responseTime"];
  theme: ClientBrandTheme;
}) {
  const { summary, repliedCount, totalNegative } = responseTime;

  // Calculate response rate for visual
  const rate = totalNegative > 0 ? Math.round((repliedCount / totalNegative) * 100) : 100;

  let statusColor = "#059669"; // green
  let statusEmoji = "\u26A1"; // lightning
  if (rate < 50) {
    statusColor = "#DC2626";
    statusEmoji = "\u23F0"; // alarm clock
  } else if (rate < 80) {
    statusColor = "#D97706";
    statusEmoji = "\uD83D\uDCAC"; // speech bubble
  }

  return (
    <div
      className="rounded-lg p-4 border"
      style={{ borderColor: "#E2E8F0", backgroundColor: "#FAFAFA" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{statusEmoji}</span>
        <div className="flex-1">
          <h4
            className="text-sm font-semibold mb-1"
            style={{ color: theme.secondary }}
          >
            Response to Complaints
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: theme.textDark }}>
            {summary}
          </p>
          {totalNegative > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-2 flex-1 rounded-full overflow-hidden"
                style={{ backgroundColor: "#E5E7EB" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: statusColor }}
              >
                {rate}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function GuestHappiness({
  data,
  theme,
}: {
  data?: GuestHappinessData;
  theme: ClientBrandTheme;
}) {
  if (!data) return null;

  const { sentiment, menuMentions, responseTime } = data;

  return (
    <section
      className="rounded-xl p-5 border mt-6"
      style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}
    >
      <h2
        className="text-lg font-bold mb-4 flex items-center gap-2"
        style={{ color: theme.secondary }}
      >
        <span>{"\uD83D\uDC9B"}</span> Guest Happiness
        <span
          className="text-xs font-normal px-2 py-0.5 rounded-full"
          style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
        >
          What People Are Saying
        </span>
      </h2>

      {/* ── Sentiment Summary ── */}
      <div
        className="rounded-xl p-4 mb-4 border"
        style={{
          backgroundColor: sentiment.positivePercent >= 70 ? "#F0FDF4" : "#FFFBEB",
          borderColor: sentiment.positivePercent >= 70 ? "#BBF7D0" : "#FDE68A",
        }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: theme.textDark }}
        >
          {sentiment.summary}
        </p>
        <SentimentBar positivePercent={sentiment.positivePercent} theme={theme} />
      </div>

      {/* ── Praises & Complaints ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {sentiment.topPraises.length > 0 && (
          <div className="rounded-lg p-3 border" style={{ borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#059669" }}>
              {"\uD83C\uDF1F"} What they love
            </h4>
            <ul className="space-y-1">
              {sentiment.topPraises.map((praise, i) => (
                <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: theme.textDark }}>
                  <span style={{ color: "#059669" }}>{"\u2713"}</span>
                  {praise}
                </li>
              ))}
            </ul>
          </div>
        )}
        {sentiment.topComplaints.length > 0 && (
          <div className="rounded-lg p-3 border" style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#DC2626" }}>
              {"\uD83D\uDCA1"} Room to grow
            </h4>
            <ul className="space-y-1">
              {sentiment.topComplaints.map((complaint, i) => (
                <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: theme.textDark }}>
                  <span style={{ color: "#D97706" }}>{"\u25B8"}</span>
                  {complaint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Top Mentioned Menu Items ── */}
      {menuMentions.items.length > 0 && (
        <div className="mb-4">
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wide"
            style={{ color: theme.muted }}
          >
            {"\uD83C\uDF7D\uFE0F"} Most Talked About
          </h3>
          <div className="flex flex-wrap gap-2">
            {menuMentions.items.map((item, i) => (
              <MenuItemPill
                key={i}
                name={item.name}
                mentions={item.mentions}
                sentiment={item.sentiment}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Response Time ── */}
      <ResponseTimeCard responseTime={responseTime} theme={theme} />

      {/* ── Footer: analysis timestamp ── */}
      {data.analyzedAt && (
        <p
          className="text-xs mt-3 text-right"
          style={{ color: theme.muted }}
        >
          AI analysis from {data.reviewsAnalyzed} reviews {"\u2022"}{" "}
          Updated{" "}
          {new Date(data.analyzedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </section>
  );
}
