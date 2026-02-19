"use client";

import { ClientHuddle, ClientBrandTheme } from "@/app/lib/clients";

export default function HuddleNotes({
  huddles,
  nextHuddle,
  theme,
}: {
  huddles: ClientHuddle[];
  nextHuddle: string;
  theme: ClientBrandTheme;
}) {
  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.secondary }}>
          <span>{"\uD83D\uDCDD"}</span> Monthly Huddles
        </h2>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
        >
          Next: {nextHuddle}
        </span>
      </div>
      <div className="space-y-3">
        {huddles.map((huddle) => (
          <a
            key={huddle.month}
            href={huddle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border transition-all group"
            style={{ borderColor: "#F1F5F9" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${theme.accent}40`;
              e.currentTarget.style.backgroundColor = `${theme.primaryLight}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#F1F5F9";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: theme.secondary }}>
                  {huddle.month}
                </p>
                <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{huddle.summary}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: theme.muted }}>{huddle.date}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
