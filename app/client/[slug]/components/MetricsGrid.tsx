import { ClientMetric, ClientBrandTheme } from "@/app/lib/clients";

const statusStyles = {
  "on-track": { bg: "#ECFDF5", border: "#A7F3D0", dot: "#34D399" },
  "needs-work": { bg: "#FFFBEB", border: "#FDE68A", dot: "#FBBF24" },
  "critical": { bg: "#FEF2F2", border: "#FECACA", dot: "#F87171" },
};

export default function MetricsGrid({
  metrics,
  theme,
}: {
  metrics: ClientMetric[];
  theme: ClientBrandTheme;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.secondary }}>
        <span>\uD83D\uDCCA</span> Brand Health Metrics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const s = statusStyles[metric.status];
          return (
            <div
              key={metric.label}
              className="rounded-xl p-4 transition-all hover:shadow-md border"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: theme.muted }}
                >
                  {metric.label}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.dot }}
                />
              </div>
              <p className="text-2xl font-bold" style={{ color: theme.secondary }}>
                {metric.value}
              </p>
              <p className="text-xs mt-1" style={{ color: theme.muted }}>
                Target: {metric.target}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
