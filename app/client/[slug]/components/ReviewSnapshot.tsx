import { ReviewPlatform, ClientBrandTheme } from "@/app/lib/clients";

export default function ReviewSnapshot({
  reviews,
  positiveThemes,
  negativeThemes,
  theme,
}: {
  reviews: ReviewPlatform[];
  positiveThemes: string[];
  negativeThemes: string[];
  theme: ClientBrandTheme;
}) {
  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.secondary }}>
        <span>\u2B50</span> Reviews & Reputation
      </h2>
      {/* Review table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide" style={{ color: theme.muted, borderBottom: `1px solid ${theme.primaryLight}` }}>
              <th className="pb-2 font-medium">Platform</th>
              <th className="pb-2 font-medium">Rating</th>
              <th className="pb-2 font-medium">Reviews (mo)</th>
              <th className="pb-2 font-medium">Response</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.platform} style={{ borderBottom: "1px solid #F8FAFC" }}>
                <td className="py-2.5 font-medium" style={{ color: theme.secondary }}>{r.platform}</td>
                <td className="py-2.5 font-semibold" style={{ color: theme.primary }}>{r.rating}</td>
                <td className="py-2.5" style={{ color: theme.muted }}>{r.reviewCount}</td>
                <td className="py-2.5" style={{ color: theme.muted }}>{r.responseRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Themes */}
      <div className="mt-4 space-y-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#059669" }}>
            \uD83D\uDC4D Positive
          </span>
          <p className="text-sm mt-0.5" style={{ color: theme.muted }}>{positiveThemes.join(" \u2022 ")}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#DC2626" }}>
            \uD83D\uDC4E Negative
          </span>
          <p className="text-sm mt-0.5" style={{ color: theme.muted }}>{negativeThemes.join(" \u2022 ")}</p>
        </div>
      </div>
    </section>
  );
}
