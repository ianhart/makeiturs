import { ClientAsset, ClientBrandTheme } from "@/app/lib/types";

export default function AssetLibrary({
  assets,
  theme,
}: {
  assets: ClientAsset[];
  theme: ClientBrandTheme;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.secondary }}>
        <span>\uD83D\uDCC1</span> Asset Library
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {assets.map((asset) => (
          <a
            key={asset.category}
            href={asset.canvaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl p-4 border transition-all group text-center hover:shadow-md"
            style={{ backgroundColor: theme.cardBg, borderColor: "#E2E8F0" }}
          >
            <span className="text-3xl block mb-2">{asset.icon}</span>
            <h3 className="text-sm font-semibold transition-colors" style={{ color: theme.secondary }}>
              {asset.category}
            </h3>
            <p className="text-xs mt-1 line-clamp-2" style={{ color: theme.muted }}>{asset.description}</p>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium mt-2"
              style={{ color: theme.primary }}
            >
              Open in Canva
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
