import { NextResponse } from "next/server";
import { regenerateToken } from "@/app/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const newToken = await regenerateToken(Number(id));
    return NextResponse.json({ token: newToken });
  } catch (e) {
    return NextResponse.json({ error: "Failed to regenerate token", details: String(e) }, { status: 500 });
  }
}
