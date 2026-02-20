import { NextResponse } from "next/server";
import { getAllClients, createClient } from "@/app/lib/db";

export async function GET() {
  try {
    const clients = await getAllClients();
    return NextResponse.json({ clients });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch clients", details: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.slug || !body.location) {
      return NextResponse.json(
        { error: "name, slug, and location are required" },
        { status: 400 }
      );
    }

    // Default brand theme if not provided
    const brandTheme = body.brandTheme || {
      primary: "#333333",
      primaryLight: "#E5E5E5",
      secondary: "#333333",
      accent: "#666666",
      accentLight: "#999999",
      bg: "#FAFAFA",
      cardBg: "#FFFFFF",
      textDark: "#333333",
      muted: "#8A8A8A",
    };

    const client = await createClient({
      name: body.name,
      slug: body.slug,
      location: body.location,
      tagline: body.tagline,
      logoUrl: body.logoUrl,
      brandColor: body.brandColor || brandTheme.primary,
      brandTheme,
      overallHealth: body.overallHealth,
      healthSummary: body.healthSummary,
      topIssue: body.topIssue,
      actionNeeded: body.actionNeeded,
      nextHuddle: body.nextHuddle,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create client", details: String(e) }, { status: 500 });
  }
}
