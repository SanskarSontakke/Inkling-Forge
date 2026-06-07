import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalComics = db.prepare("SELECT COUNT(*) as count FROM comics").get().count;
    const totalEpisodes = db.prepare("SELECT COUNT(*) as count FROM episodes").get().count;
    const totalPages = db.prepare("SELECT COUNT(*) as count FROM pages").get().count;
    const totalCreators = db.prepare("SELECT COUNT(*) as count FROM creators").get().count;

    // Get recent comics
    const recentComics = db.prepare(`
      SELECT id, title, updated_at, 'comic' as type 
      FROM comics 
      ORDER BY updated_at DESC 
      LIMIT 3
    `).all();

    // Get recent creators
    const recentCreators = db.prepare(`
      SELECT id, name as title, updated_at, 'creator' as type 
      FROM creators 
      ORDER BY updated_at DESC 
      LIMIT 3
    `).all();

    // Combine and sort
    const recentActivity = [...recentComics, ...recentCreators]
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalComics,
        totalEpisodes,
        totalPages,
        totalCreators
      },
      recentActivity
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}
