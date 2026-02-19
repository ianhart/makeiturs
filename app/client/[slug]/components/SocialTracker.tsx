import { SocialPost, ClientBrandTheme } from "@/app/lib/clients";

const statusConfig = {
  posted: { icon: "\u2705", label: "Posted", color: "#059669" },
  scheduled: { icon: "\uD83D\uDCC5", label: "Scheduled", color: "#2563EB" },
  missed: { icon: "\u274C", label: "Missed", color: "#DC2626" },
};

const platformIcon: Record<string, string> = {
  Instagram: "\uD83D\uDCF7",
  Facebook: "\uD83D\uDCD8",
  "Google Business": "\uD83D\uDCCD",
  TikTok: "\uD83C\uDFB5",
  Twitter: "\uD83D\uDC26",
};

export default function SocialTracker({
  posts,
  theme,
}: {
  posts: SocialPost[];
  theme: ClientBrandTheme;
}) {
  const posted = posts.filter((p) => p.status === "posted").length;
  const total = posts.length;

  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.secondary }}>
          <span>\uD83D\uDCF1</span> Social This Week
        </h2>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
        >
          {posted}/{total} posted
        </span>
      </div>
      <div className="space-y-2">
        {posts.map((post, i) => {
          const config = statusConfig[post.status];
          return (
            <div
              key={`${post.day}-${post.platform}-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors"
            >
              <span className="text-sm w-10 font-medium" style={{ color: theme.muted }}>{post.day}</span>
              <span className="text-base">{platformIcon[post.platform] || "\uD83C\uDF10"}</span>
              <span className="text-sm flex-1 truncate" style={{ color: theme.secondary }}>{post.content}</span>
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: config.color }}>
                <span>{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
