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
    const creator = db.prepare("SELECT * FROM creators WHERE id = ?").get(id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const comics = db.prepare(`
      SELECT c.id, c.title, c.cover_image, c.genre
      FROM comics c
      JOIN comic_creators cc ON c.id = cc.comic_id
      WHERE cc.creator_id = ?
    `).all(id);

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

    const creatorExists = db.prepare("SELECT 1 FROM creators WHERE id = ?").get(id);
    if (!creatorExists) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    db.prepare(`
      UPDATE creators
      SET name = ?, role = ?, bio = ?, followers = ?, reads = ?, twitter = ?, instagram = ?, artstation = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, role, bio, followers, reads, twitter, instagram, artstation, id);

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
    const result = db.prepare("DELETE FROM creators WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
