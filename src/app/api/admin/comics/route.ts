import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: comics, error } = await db
      .from("comics")
      .select("*, comic_creators(creator_id)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedComics = (comics || []).map((comic: any) => ({
      ...comic,
      is_original: !!comic.is_original,
      is_trending: !!comic.is_trending,
      creatorIds: comic.comic_creators ? comic.comic_creators.map((cc: any) => cc.creator_id) : []
    }));

    return NextResponse.json({ comics: formattedComics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      slug,
      description = "",
      genre = "Action",
      score = "0.0",
      reads = "0",
      rank = "",
      is_original = false,
      creatorIds = []
    } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const id = slug; // use slug as ID to match existing DB layout

    // Check slug uniqueness
    const { data: exists, error: checkError } = await db
      .from("comics")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) throw checkError;
    if (exists) {
      return NextResponse.json({ error: "A comic with this slug already exists" }, { status: 400 });
    }

    // Insert comic
    const { error: insertError } = await db.from("comics").insert({
      id,
      title,
      slug,
      description,
      genre,
      score,
      reads,
      rank,
      is_original
    });

    if (insertError) throw insertError;

    // Insert creators mapping
    if (creatorIds.length > 0) {
      const comicCreators = creatorIds.map((creatorId: string) => ({
        comic_id: id,
        creator_id: creatorId
      }));

      const { error: relationError } = await db.from("comic_creators").insert(comicCreators);
      if (relationError) throw relationError;
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
