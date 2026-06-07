import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const creator = db.prepare("SELECT * FROM creators WHERE id = ?").get(id);

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const comics = db.prepare(`
      SELECT c.*
      FROM comics c
      JOIN comic_creators cc ON c.id = cc.comic_id
      WHERE cc.creator_id = ?
    `).all(id);

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
      description: comic.description
    }));

    const formattedCreator = {
      id: creator.id,
      name: creator.name,
      avatar: creator.avatar,
      bio: creator.bio,
      followers: creator.followers,
      reads: creator.reads,
      role: creator.role,
      socials: {
        twitter: creator.twitter || undefined,
        instagram: creator.instagram || undefined,
        artstation: creator.artstation || undefined
      }
    };

    return NextResponse.json({ creator: formattedCreator, comics: formattedComics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
