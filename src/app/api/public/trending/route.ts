import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const trendingComics = db.prepare(`
      SELECT c.*, GROUP_CONCAT(cc.creator_id) as creator_ids
      FROM comics c
      LEFT JOIN comic_creators cc ON c.id = cc.comic_id
      WHERE c.is_trending = 1
      GROUP BY c.id
      ORDER BY c.trending_rank ASC
    `).all();

    const formattedList = trendingComics.map((comic: any) => ({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      genre: comic.genre,
      reads: comic.reads,
      score: comic.score,
      rank: comic.rank,
      isOriginal: !!comic.is_original,
      coverImage: comic.cover_image,
      bannerImage: comic.banner_image,
      description: comic.description,
      creatorIds: comic.creator_ids ? comic.creator_ids.split(",") : []
    }));

    return NextResponse.json({ comics: formattedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
