import { notFound } from "next/navigation";
import { getClient, getAllClientSlugs } from "@/app/lib/clients";
import PortalHeader from "./components/PortalHeader";
import HealthOverview from "./components/HealthOverview";
import MetricsGrid from "./components/MetricsGrid";
import RequestQueue from "./components/RequestQueue";
import CampaignTracker from "./components/CampaignTracker";
import SocialTracker from "./components/SocialTracker";
import ReviewSnapshot from "./components/ReviewSnapshot";
import AssetLibrary from "./components/AssetLibrary";
import HuddleNotes from "./components/HuddleNotes";
import QuickLinks from "./components/QuickLinks";
import PortalFooter from "./components/PortalFooter";

export function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ slug }));
}

export default async function ClientPortal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getClient(slug);

  if (!client) {
    notFound();
  }

  const theme = client.brandTheme;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PortalHeader client={client} />

      {/* Health Overview Banner */}
      <HealthOverview client={client} />

      {/* Metrics Grid */}
      <MetricsGrid metrics={client.metrics} theme={theme} />

      {/* Two-column layout for requests + campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RequestQueue requests={client.requests} theme={theme} />
        <CampaignTracker campaigns={client.campaigns} theme={theme} />
      </div>

      {/* Two-column layout for social + reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SocialTracker posts={client.socialPosts} theme={theme} />
        <ReviewSnapshot
          reviews={client.reviews}
          positiveThemes={client.positiveThemes}
          negativeThemes={client.negativeThemes}
          theme={theme}
        />
      </div>

      {/* Asset Library */}
      <AssetLibrary assets={client.assets} theme={theme} />

      {/* Two-column layout for huddles + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <HuddleNotes huddles={client.huddles} nextHuddle={client.nextHuddle} theme={theme} />
        <QuickLinks links={client.quickLinks} theme={theme} />
      </div>

      <PortalFooter theme={theme} />
    </main>
  );
}
