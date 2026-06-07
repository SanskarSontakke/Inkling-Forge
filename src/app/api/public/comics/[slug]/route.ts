import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const comic = db.prepare("SELECT * FROM comics WHERE slug = ?").get(slug);

    if (!comic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    // Get creators
    const creators = db.prepare(`
      SELECT c.*
      FROM creators c
      JOIN comic_creators cc ON c.id = cc.creator_id
      WHERE cc.comic_id = ?
    `).all(comic.id);

    // Get episodes
    const episodes = db.prepare(`
      SELECT * FROM episodes
      WHERE comic_id = ?
      ORDER BY episode_number ASC
    `).all(comic.id);

    // For each episode, get panels
    const chapters = episodes.map((ep: any) => {
      const pages = db.prepare(`
        SELECT image_path
        FROM pages
        WHERE episode_id = ?
        ORDER BY page_number ASC
      `).all(ep.id);

      return {
        id: ep.id,
        title: ep.title,
        description: ep.description,
        episode_number: ep.episode_number,
        coverImage: ep.cover_image,
        // Map page paths to panels array to keep layout identical to client expectations
        panels: pages.map((p: any) => p.image_path)
      };
    });

    const formattedComic = {
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
      creatorIds: creators.map((c: any) => c.id),
      chapters
    };

    return NextResponse.json({ comic: formattedComic, creators });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
