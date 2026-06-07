import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data: creator, error: creatorError } = await db
      .from("creators")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (creatorError) throw creatorError;
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const { data: comicCreators, error: ccError } = await db
      .from("comic_creators")
      .select("comic_id")
      .eq("creator_id", id);

    if (ccError) throw ccError;

    let formattedComics: any[] = [];
    const comicIds = comicCreators ? comicCreators.map((cc: any) => cc.comic_id) : [];
    
    if (comicIds.length > 0) {
      const { data: comics, error: comicsError } = await db
        .from("comics")
        .select("*")
        .in("id", comicIds);

      if (comicsError) throw comicsError;

      formattedComics = (comics || []).map((comic: any) => ({
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
    }

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
