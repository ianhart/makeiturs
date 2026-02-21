import { notFound } from "next/navigation";
import { getClientByToken, updateLastAccessed } from "@/app/lib/db";
import PortalHeader from "./components/PortalHeader";
import HealthOverview from "./components/HealthOverview";
import MetricsGrid from "./components/MetricsGrid";
import RequestQueue from "./components/RequestQueue";
import CampaignTracker from "./components/CampaignTracker";
import SocialTracker from "./components/SocialTracker";
import ReviewSnapshot from "./components/ReviewSnapshot";
import GuestHappiness from "./components/GuestHappiness";
import AssetLibrary from "./components/AssetLibrary";
import HuddleNotes from "./components/HuddleNotes";
import QuickLinks from "./components/QuickLinks";
import PortalFooter from "./components/PortalFooter";
import BackgroundRefresh from "./components/BackgroundRefresh";

// Force dynamic rendering — token lookup requires database query
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientPortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await getClientByToken(token);

  if (!client) {
    notFound();
  }

  // Track last access (fire and forget)
  updateLastAccessed(client.id).catch(() => {});

  const theme = client.brandTheme;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PortalHeader client={client} />

      {/* Health Overview Banner */}
      <HealthOverview client={client} />

      {/* Metrics Grid */}
      <MetricsGrid
        metrics={client.metrics}
        metricsNarrative={client.metricsNarrative}
        theme={theme}
      />

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
          weeklyVibe={client.weeklyVibe}
          recentReviews={client.recentReviews}
          theme={theme}
        />
      </div>

      {/* Guest Happiness — AI-powered review insights */}
      <GuestHappiness data={client.guestHappiness} theme={theme} />

      {/* Asset Library */}
      <AssetLibrary assets={client.assets} theme={theme} />

      {/* Two-column layout for huddles + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <HuddleNotes huddles={client.huddles} nextHuddle={client.nextHuddle} theme={theme} />
        <QuickLinks links={client.quickLinks} theme={theme} />
      </div>

      <PortalFooter theme={theme} />

      {/* Background sync trigger — fires if data is >15 min stale */}
      <BackgroundRefresh token={token} lastSyncAt={client.lastSyncAt} />
    </main>
  );
}
