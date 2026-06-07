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
    const episode = db.prepare("SELECT 1 FROM episodes WHERE id = ?").get(episodeId);
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Run update in a transaction
    const resetTransaction = db.transaction(() => {
      db.prepare("UPDATE pages SET page_number = original_page_number WHERE episode_id = ?").run(episodeId);
      db.prepare("UPDATE episodes SET updated_at = datetime('now') WHERE id = ?").run(episodeId);
    });

    resetTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset pages order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
