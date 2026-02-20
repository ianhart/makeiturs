import { ClientMetric, ClientBrandTheme } from "@/app/lib/types";

const statusConfig = {
  "on-track": { bg: "#ECFDF5", border: "#A7F3D0", dot: "#34D399", label: "On Track" },
  "needs-work": { bg: "#FFFBEB", border: "#FDE68A", dot: "#FBBF24", label: "Needs Work" },
  "critical": { bg: "#FEF2F2", border: "#FECACA", dot: "#F87171", label: "Attention" },
};

export default function MetricsGrid({
  metrics,
  metricsNarrative,
  theme,
}: {
  metrics: ClientMetric[];
  metricsNarrative?: string;
  theme: ClientBrandTheme;
}) {
  return (
    <section>
      <h2
        className="text-lg font-bold mb-3 flex items-center gap-2"
        style={{ color: theme.secondary }}
      >
        <span>{"\uD83D\uDCCA"}</span> Brand Health Metrics
      </h2>

      {/* Narrative summary banner */}
      {metricsNarrative && (
        <div
          className="rounded-xl p-4 mb-4 text-sm leading-relaxed border"
          style={{
            backgroundColor: theme.primaryLight + "40",
            borderColor: theme.primaryLight,
            color: theme.textDark,
          }}
        >
          <span className="font-semibold">This week at a glance:</span>{" "}
          {metricsNarrative}
        </div>
      )}

      {/* Metric cards — larger, narrative style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((metric, idx) => {
          const s = statusConfig[metric.status];
          return (
            <div
              key={`${metric.label}-${idx}`}
              className="rounded-xl p-4 transition-all hover:shadow-md border"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            >
              {/* Status badge + label */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.muted }}
                >
                  {metric.label}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: s.dot + "20", color: s.dot }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.dot }}
                  />
                  {s.label}
                </span>
              </div>

              {/* Value — now a narrative sentence */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.secondary }}
              >
                {metric.value}
              </p>

              {/* Target hint */}
              <p className="text-xs mt-2 opacity-70" style={{ color: theme.muted }}>
                {"\uD83C\uDFAF"} {metric.target}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
