import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  try {
    let query = `
      SELECT c.*, GROUP_CONCAT(cc.creator_id) as creator_ids
      FROM comics c
      LEFT JOIN comic_creators cc ON c.id = cc.comic_id
    `;
    const params: any[] = [];

    const conditions: string[] = [];
    if (genre && genre !== "All" && genre !== "Originals") {
      conditions.push("LOWER(c.genre) = LOWER(?)");
      params.push(genre);
    } else if (genre === "Originals") {
      conditions.push("c.is_original = 1");
    }

    if (search) {
      conditions.push("(LOWER(c.title) LIKE ? OR LOWER(c.description) LIKE ? OR LOWER(c.genre) LIKE ?)");
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY c.id ORDER BY c.created_at DESC";

    const comics = db.prepare(query).all(...params);

    const formattedComics = comics.map((comic: any) => ({
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

    return NextResponse.json({ comics: formattedComics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
