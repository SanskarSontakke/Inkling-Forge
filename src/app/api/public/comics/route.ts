import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  try {
    // Select comics and their associated creator links
    let query = db.from("comics").select("*, comic_creators(creator_id)");

    if (genre && genre !== "All" && genre !== "Originals") {
      query = query.ilike("genre", genre);
    } else if (genre === "Originals") {
      query = query.eq("is_original", true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,genre.ilike.%${search}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data: comics, error } = await query;
    if (error) throw error;

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
      creatorIds: comic.comic_creators ? comic.comic_creators.map((cc: any) => cc.creator_id) : []
    }));

    return NextResponse.json({ comics: formattedComics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
