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
    const { data: episode, error: epError } = await db
      .from("episodes")
      .select("*, comics(title)")
      .eq("id", id)
      .maybeSingle();

    if (epError) throw epError;
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const { data: pages, error: pagesError } = await db
      .from("pages")
      .select("*")
      .eq("episode_id", id)
      .order("page_number", { ascending: true });

    if (pagesError) throw pagesError;

    const formattedEpisode = {
      ...episode,
      comic_title: episode.comics ? episode.comics.title : ""
    };

    return NextResponse.json({ episode: formattedEpisode, pages });
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
    const { title, description = "", episode_number } = await req.json();

    if (!title || episode_number === undefined) {
      return NextResponse.json({ error: "Title and episode number are required" }, { status: 400 });
    }

    const { data: episodeExists, error: checkError } = await db
      .from("episodes")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!episodeExists) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const { error: updateError } = await db
      .from("episodes")
      .update({
        title,
        description,
        episode_number,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) throw updateError;

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
      .from("episodes")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
