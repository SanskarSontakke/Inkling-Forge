import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { data: trendingComics, error } = await db
      .from("comics")
      .select("*, comic_creators(creator_id)")
      .eq("is_trending", true)
      .order("trending_rank", { ascending: true });

    if (error) throw error;

    const formattedList = (trendingComics || []).map((comic: any) => ({
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
      creatorIds: comic.comic_creators ? comic.comic_creators.map((cc: any) => cc.creator_id) : []
    }));

    return NextResponse.json({ comics: formattedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
