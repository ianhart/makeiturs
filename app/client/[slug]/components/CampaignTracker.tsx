import { ClientCampaign, ClientBrandTheme } from "@/app/lib/clients";

const statusConfig = {
  active: { badge: "bg-emerald-100 text-emerald-700", label: "Active" },
  planning: { badge: "bg-blue-100 text-blue-700", label: "Planning" },
  completed: { badge: "bg-slate-100 text-slate-600", label: "Completed" },
};

const milestoneIcon = {
  done: "\u2705",
  "in-progress": "\uD83D\uDD04",
  pending: "\u2B1C",
  scheduled: "\uD83D\uDCC5",
};

export default function CampaignTracker({
  campaigns,
  theme,
}: {
  campaigns: ClientCampaign[];
  theme: ClientBrandTheme;
}) {
  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.secondary }}>
        <span>\uD83D\uDE80</span> Campaigns
      </h2>
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const config = statusConfig[campaign.status];
          return (
            <a
              key={campaign.title}
              href={campaign.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border transition-all group"
              style={{ borderColor: "#F1F5F9" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{campaign.emoji}</span>
                  <h3 className="font-semibold" style={{ color: theme.secondary }}>
                    {campaign.title}
                  </h3>
                </div>
                <span className={`${config.badge} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: theme.muted }}>{campaign.window}</p>
              {/* Progress bar with brand color */}
              <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: `${theme.primary}20` }}>
                <div
                  className="rounded-full h-2 transition-all"
                  style={{ width: `${campaign.progress}%`, backgroundColor: theme.primary }}
                />
              </div>
              <p className="text-xs mb-2" style={{ color: theme.muted }}>
                <span className="font-semibold">Goal:</span> {campaign.goal}
              </p>
              {/* Milestones (compact) */}
              <div className="space-y-1">
                {campaign.milestones.slice(0, 3).map((m) => (
                  <div key={m.task} className="flex items-center gap-2 text-xs">
                    <span>{milestoneIcon[m.status]}</span>
                    <span style={{ color: theme.muted }}>{m.task}</span>
                    <span className="ml-auto" style={{ color: `${theme.muted}80` }}>{m.due}</span>
                  </div>
                ))}
                {campaign.milestones.length > 3 && (
                  <p className="text-xs font-medium mt-1" style={{ color: theme.primary }}>
                    +{campaign.milestones.length - 3} more milestones...
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
