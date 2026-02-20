import { NextResponse } from "next/server";
import { updateClientSection } from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!Array.isArray(body.data)) {
      return NextResponse.json({ error: "data must be an array" }, { status: 400 });
    }
    await updateClientSection(Number(id), "huddles", body.data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update huddles", details: String(e) }, { status: 500 });
  }
}
