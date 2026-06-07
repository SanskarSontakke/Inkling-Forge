import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const episodes = db.prepare(`
      SELECT e.*, COUNT(p.id) as page_count
      FROM episodes e
      LEFT JOIN pages p ON e.id = p.episode_id
      WHERE e.comic_id = ?
      GROUP BY e.id
      ORDER BY e.episode_number ASC
    `).all(id);

    return NextResponse.json({ episodes });
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

    const comicExists = db.prepare("SELECT cover_image FROM comics WHERE id = ?").get(id);
    if (!comicExists) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    const episodeId = `${id}-ch-${episode_number}`;

    // Check uniqueness of episode ID
    const exists = db.prepare("SELECT 1 FROM episodes WHERE id = ?").get(episodeId);
    if (exists) {
      return NextResponse.json({ error: `Episode ${episode_number} already exists` }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO episodes (id, comic_id, title, description, episode_number, cover_image)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(episodeId, id, title, description, episode_number, comicExists.cover_image || "");

    return NextResponse.json({ success: true, id: episodeId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
