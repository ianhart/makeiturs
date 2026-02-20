"use client";

import { ClientBrandTheme } from "@/app/lib/types";

export default function QuickLinks({
  links,
  theme,
}: {
  links: { label: string; url: string; icon: string }[];
  theme: ClientBrandTheme;
}) {
  return (
    <section className="rounded-xl p-5 border" style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.secondary }}>
        <span>{"\uD83D\uDD17"}</span> Quick Links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border transition-all group"
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
            <span className="text-2xl">{link.icon}</span>
            <span className="text-sm font-semibold" style={{ color: theme.secondary }}>
              {link.label}
            </span>
            <svg
              className="w-4 h-4 ml-auto"
              style={{ color: theme.muted }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
