import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Command Center | Make It Urs",
  description: "Your all-in-one brand management dashboard powered by Make It Urs.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-bg">
      {children}
    </div>
  );
}
