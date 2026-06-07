import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: episodeId } = await params;

  try {
    const { pageIds } = await req.json();

    if (!pageIds || !Array.isArray(pageIds)) {
      return NextResponse.json({ error: "pageIds array is required" }, { status: 400 });
    }

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

    // Run updates concurrently
    const updatePromises = pageIds.map((pageId: string, idx: number) => {
      return db
        .from("pages")
        .update({ page_number: idx + 1 })
        .eq("id", pageId)
        .eq("episode_id", episodeId);
    });

    const results = await Promise.all(updatePromises);
    
    // Check if any error occurred
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
    console.error("Reorder pages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
