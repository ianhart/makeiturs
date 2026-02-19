import { ClientBrandTheme } from "@/app/lib/clients";

export default function PortalFooter({ theme }: { theme?: ClientBrandTheme }) {
  return (
    <footer className="mt-10 pt-6 border-t text-center" style={{ borderColor: "#E2E8F0" }}>
      <p className="text-sm" style={{ color: theme?.muted || "#8A8A8A" }}>
        Powered by{" "}
        <a
          href="/"
          className="font-semibold transition-colors"
          style={{ color: theme?.primary || "#E8907E" }}
        >
          Make It Urs
        </a>{" "}
        &mdash; Restaurant Growth OS
      </p>
      <p className="text-xs mt-1" style={{ color: `${theme?.muted || "#8A8A8A"}80` }}>
        Everything in one place. No more digging.
      </p>
    </footer>
  );
}
