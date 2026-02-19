"use client";

import { ClientRequest, ClientBrandTheme } from "@/app/lib/clients";

const priorityConfig = {
  high: { label: "High", bg: "#FEF2F2", text: "#B91C1C" },
  normal: { label: "Normal", bg: "#FFFBEB", text: "#92400E" },
  low: { label: "Low", bg: "#F8FAFC", text: "#64748B" },
};

export default function RequestQueue({
  requests,
  theme,
}: {
  requests: ClientRequest[];
  theme: ClientBrandTheme;
}) {
  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.secondary }}>
          <span>\uD83D\uDCE5</span> Open Requests
        </h2>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
        >
          {requests.length} active
        </span>
      </div>
      <div className="space-y-3">
        {requests.map((req) => {
          const prio = priorityConfig[req.priority];
          return (
            <a
              key={req.title}
              href={req.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border transition-all group"
              style={{ borderColor: "#F1F5F9" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${theme.primary}40`;
                e.currentTarget.style.backgroundColor = `${theme.primaryLight}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#F1F5F9";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: theme.secondary }}>
                    {req.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: theme.muted }}>{req.type}</span>
                    <span className="text-xs" style={{ color: theme.muted }}>&middot;</span>
                    <span className="text-xs" style={{ color: theme.muted }}>Due {req.deadline}</span>
                  </div>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: prio.bg, color: prio.text }}
                >
                  {prio.label}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
