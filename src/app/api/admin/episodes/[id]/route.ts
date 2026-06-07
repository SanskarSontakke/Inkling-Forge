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
    const episode = db.prepare(`
      SELECT e.*, c.title as comic_title
      FROM episodes e
      JOIN comics c ON e.comic_id = c.id
      WHERE e.id = ?
    `).get(id);

    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const pages = db.prepare(`
      SELECT * FROM pages
      WHERE episode_id = ?
      ORDER BY page_number ASC
    `).all(id);

    return NextResponse.json({ episode, pages });
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

    const episode = db.prepare("SELECT 1 FROM episodes WHERE id = ?").get(id);
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    db.prepare(`
      UPDATE episodes
      SET title = ?, description = ?, episode_number = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description, episode_number, id);

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
    const result = db.prepare("DELETE FROM episodes WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
