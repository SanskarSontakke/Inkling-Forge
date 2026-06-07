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
    const episode = db.prepare("SELECT 1 FROM episodes WHERE id = ?").get(episodeId);
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Run updates in a transaction
    const updateTransaction = db.transaction(() => {
      const updateStmt = db.prepare("UPDATE pages SET page_number = ? WHERE id = ? AND episode_id = ?");
      
      pageIds.forEach((pageId, idx) => {
        updateStmt.run(idx + 1, pageId, episodeId);
      });

      // Update episode timestamp
      db.prepare("UPDATE episodes SET updated_at = datetime('now') WHERE id = ?").run(episodeId);
    });

    updateTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder pages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
