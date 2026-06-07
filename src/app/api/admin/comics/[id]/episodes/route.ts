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
    const { data: episodes, error } = await db
      .from("episodes")
      .select("*, pages(id)")
      .eq("comic_id", id)
      .order("episode_number", { ascending: true });

    if (error) throw error;

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

    return NextResponse.json({ episodes: formattedEpisodes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { title, episode_number, description = "" } = await req.json();

    if (!title || episode_number === undefined) {
      return NextResponse.json({ error: "Title and episode number are required" }, { status: 400 });
    }

    const { data: comicExists, error: comicError } = await db
      .from("comics")
      .select("cover_image")
      .eq("id", id)
      .maybeSingle();

    if (comicError) throw comicError;
    if (!comicExists) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    const episodeId = `${id}-ch-${episode_number}`;

    // Check uniqueness of episode ID
    const { data: exists, error: checkError } = await db
      .from("episodes")
      .select("id")
      .eq("id", episodeId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (exists) {
      return NextResponse.json({ error: `Episode ${episode_number} already exists` }, { status: 400 });
    }

    const { error: insertError } = await db.from("episodes").insert({
      id: episodeId,
      comic_id: id,
      title,
      description,
      episode_number,
      cover_image: comicExists.cover_image || ""
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, id: episodeId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
