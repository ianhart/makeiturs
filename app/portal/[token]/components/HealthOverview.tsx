import { ClientData } from "@/app/lib/types";

const healthConfig = {
  "on-track": { bg: "#ECFDF5", border: "#A7F3D0", badge: "bg-emerald-100 text-emerald-800", icon: "\u2705", label: "On Track" },
  "needs-work": { bg: "#FFFBEB", border: "#FDE68A", badge: "bg-amber-100 text-amber-800", icon: "\uD83D\uDFE1", label: "Needs Work" },
  "critical": { bg: "#FEF2F2", border: "#FECACA", badge: "bg-red-100 text-red-800", icon: "\uD83D\uDD34", label: "Critical" },
};

export default function HealthOverview({ client }: { client: ClientData }) {
  const config = healthConfig[client.overallHealth];

  return (
    <div
      className="rounded-xl p-5 mb-6 border"
      style={{ backgroundColor: config.bg, borderColor: config.border }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <h2 className="font-bold text-lg" style={{ color: client.brandTheme.secondary }}>
              Overall Brand Health
            </h2>
            <span className={`${config.badge} text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm" style={{ color: client.brandTheme.muted }}>{client.healthSummary}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: client.brandTheme.primary }}>
            Top Issue
          </p>
          <p className="text-sm font-medium" style={{ color: client.brandTheme.secondary }}>{client.topIssue}</p>
        </div>
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${config.border}` }}>
        <p className="text-sm">
          <span className="font-semibold" style={{ color: client.brandTheme.secondary }}>Action Needed:</span>{" "}
          <span style={{ color: client.brandTheme.muted }}>{client.actionNeeded}</span>
        </p>
      </div>
    </div>
  );
}
