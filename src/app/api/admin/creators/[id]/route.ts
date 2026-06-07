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

    let comics: any[] = [];
    const comicIds = comicCreators ? comicCreators.map((cc: any) => cc.comic_id) : [];
    
    if (comicIds.length > 0) {
      const { data: fetchedComics, error: comicsError } = await db
        .from("comics")
        .select("id, title, cover_image, genre")
        .in("id", comicIds);

      if (comicsError) throw comicsError;
      comics = fetchedComics || [];
    }

    return NextResponse.json({ creator, comics });
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
      name,
      role = "",
      bio = "",
      followers = "0",
      reads = "0",
      twitter = "",
      instagram = "",
      artstation = ""
    } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: creatorExists, error: checkError } = await db
      .from("creators")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!creatorExists) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const { error: updateError } = await db
      .from("creators")
      .update({
        name,
        role,
        bio,
        followers,
        reads,
        twitter,
        instagram,
        artstation,
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
      .from("creators")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
