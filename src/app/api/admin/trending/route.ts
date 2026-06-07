import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trendingComics = db.prepare(`
      SELECT id, title, is_trending, trending_rank
      FROM comics
      ORDER BY is_trending DESC, trending_rank ASC, title ASC
    `).all();

    const formattedList = trendingComics.map((comic: any) => ({
      id: comic.id,
      title: comic.title,
      is_trending: !!comic.is_trending,
      trending_rank: comic.trending_rank
    }));

    return NextResponse.json({ comics: formattedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trendingIds = [] } = await req.json(); // Array of comic IDs in trending order

    if (!Array.isArray(trendingIds)) {
      return NextResponse.json({ error: "trendingIds must be an array" }, { status: 400 });
    }

    const updateTransaction = db.transaction(() => {
      // 1. Reset all comics trending status
      db.prepare("UPDATE comics SET is_trending = 0, trending_rank = 0").run();

      // 2. Set new trending rankings
      const updateComicRank = db.prepare(`
        UPDATE comics
        SET is_trending = 1, trending_rank = ?, updated_at = datetime('now')
        WHERE id = ?
      `);

      trendingIds.forEach((id: string, index: number) => {
        updateComicRank.run(index + 1, id);
      });
    });

    updateTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
