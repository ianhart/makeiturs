import { ClientData } from "@/app/lib/types";

export default function PortalHeader({ client }: { client: ClientData }) {
  return (
    <header className="mb-6">
      {/* Top bar with brand color accent */}
      <div
        className="h-1.5 rounded-full mb-6"
        style={{ background: `linear-gradient(to right, ${client.brandTheme.primary}, ${client.brandTheme.accent})` }}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: client.brandTheme.primary }}
          >
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: client.brandTheme.secondary }}>
              {client.name}
            </h1>
            <p className="text-sm" style={{ color: client.brandTheme.muted }}>
              Brand Command Center &middot; {client.location}
              {client.tagline && (
                <span className="ml-2 italic" style={{ color: client.brandTheme.primary }}>
                  {client.tagline}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: client.brandTheme.muted }}>
            Managed by{" "}
            <span className="font-semibold" style={{ color: client.brandTheme.accent }}>
              Make It Urs
            </span>
          </span>
          <a
            href={client.quickLinks.find((l) => l.label.includes("Request"))?.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: client.brandTheme.primary }}
          >
            + Submit Request
          </a>
        </div>
      </div>
    </header>
  );
}
