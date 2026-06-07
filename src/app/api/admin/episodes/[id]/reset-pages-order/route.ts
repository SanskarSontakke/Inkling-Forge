import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: episodeId } = await params;

  try {
    // Verify episode exists
    const { data: episodeExists, error: checkError } = await db
      .from("episodes")
      .select("id")
      .eq("id", episodeId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!episodeExists) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Fetch all pages for this episode to get their original page numbers
    const { data: pages, error: fetchError } = await db
      .from("pages")
      .select("id, original_page_number")
      .eq("episode_id", episodeId);

    if (fetchError) throw fetchError;

    // Reset page numbers concurrently
    const resetPromises = (pages || []).map((page: any) => {
      return db
        .from("pages")
        .update({ page_number: page.original_page_number })
        .eq("id", page.id)
        .eq("episode_id", episodeId);
    });

    const results = await Promise.all(resetPromises);

    // Check for any errors
    for (const res of results) {
      if (res.error) throw res.error;
    }

    // Update episode timestamp
    const { error: tsError } = await db
      .from("episodes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", episodeId);

    if (tsError) throw tsError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset pages order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
