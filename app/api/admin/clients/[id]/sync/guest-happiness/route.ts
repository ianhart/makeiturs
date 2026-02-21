import { NextResponse } from "next/server";
import { getClientById, updateClientSyncData } from "@/app/lib/db";
import { analyzeReviews } from "@/app/lib/sync/review-analyzer";
import type { IndividualReview, ReviewPlatform } from "@/app/lib/types";

// POST /api/admin/clients/[id]/sync/guest-happiness — trigger AI review analysis
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Gather reviews and platform data from the client's existing synced data
    const reviews: IndividualReview[] = client.recent_reviews || [];
    const platforms: ReviewPlatform[] = client.reviews || [];

    // Run AI analysis
    const happiness = await analyzeReviews(reviews, platforms);

    // Save to DB
    await updateClientSyncData(clientId, { guestHappiness: happiness });

    return NextResponse.json({
      success: true,
      data: happiness,
    });
  } catch (err) {
    console.error("Guest happiness analysis error:", err);
    return NextResponse.json(
      { error: `Analysis failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
