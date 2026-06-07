import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: comic, error: comicError } = await db
      .from("comics")
      .select("*, comic_creators(creator_id)")
      .eq("id", id)
      .maybeSingle();

    if (comicError) throw comicError;
    if (!comic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    const formattedComic = {
      ...comic,
      is_original: !!comic.is_original,
      is_trending: !!comic.is_trending,
      creatorIds: comic.comic_creators ? comic.comic_creators.map((cc: any) => cc.creator_id) : []
    };

    // Get episodes and join with count of pages
    const { data: episodes, error: episodesError } = await db
      .from("episodes")
      .select("*, pages(id)")
      .eq("comic_id", id)
      .order("episode_number", { ascending: true });

    if (episodesError) throw episodesError;

    const formattedEpisodes = (episodes || []).map((ep: any) => ({
      id: ep.id,
      comic_id: ep.comic_id,
      title: ep.title,
      description: ep.description || "",
      episode_number: ep.episode_number,
      cover_image: ep.cover_image,
      created_at: ep.created_at,
      updated_at: ep.updated_at,
      page_count: ep.pages ? ep.pages.length : 0
    }));

    return NextResponse.json({ comic: formattedComic, episodes: formattedEpisodes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

    const { data: comicExists, error: checkError } = await db
      .from("comics")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!comicExists) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    // Check slug uniqueness if it changed
    const { data: slugExists, error: slugCheckError } = await db
      .from("comics")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;
    if (slugExists) {
      return NextResponse.json({ error: "A comic with this slug already exists" }, { status: 400 });
    }

    // Update comic details
    const { error: updateError } = await db
      .from("comics")
      .update({
        title,
        slug,
        description,
        genre,
        score,
        reads,
        rank,
        is_original,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Reset creators mapping
    const { error: deleteCcError } = await db
      .from("comic_creators")
      .delete()
      .eq("comic_id", id);

    if (deleteCcError) throw deleteCcError;

    // Insert new creators mapping
    if (creatorIds.length > 0) {
      const comicCreators = creatorIds.map((creatorId: string) => ({
        comic_id: id,
        creator_id: creatorId
      }));

      const { error: insertCcError } = await db.from("comic_creators").insert(comicCreators);
      if (insertCcError) throw insertCcError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data, error } = await db
      .from("comics")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
