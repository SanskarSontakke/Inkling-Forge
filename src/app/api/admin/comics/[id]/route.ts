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
    const comic = db.prepare(`
      SELECT c.*, GROUP_CONCAT(cc.creator_id) as creator_ids
      FROM comics c
      LEFT JOIN comic_creators cc ON c.id = cc.comic_id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id);

    if (!comic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    const formattedComic = {
      ...comic,
      is_original: !!comic.is_original,
      is_trending: !!comic.is_trending,
      creatorIds: comic.creator_ids ? comic.creator_ids.split(",") : []
    };

    const episodes = db.prepare(`
      SELECT e.*, COUNT(p.id) as page_count
      FROM episodes e
      LEFT JOIN pages p ON e.id = p.episode_id
      WHERE e.comic_id = ?
      GROUP BY e.id
      ORDER BY e.episode_number ASC
    `).all(id);

    return NextResponse.json({ comic: formattedComic, episodes });
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

    const comicExists = db.prepare("SELECT 1 FROM comics WHERE id = ?").get(id);
    if (!comicExists) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    // Check slug uniqueness if it changed
    const slugExists = db.prepare("SELECT id FROM comics WHERE slug = ? AND id != ?").get(slug, id);
    if (slugExists) {
      return NextResponse.json({ error: "A comic with this slug already exists" }, { status: 400 });
    }

    // Run in a transaction
    const updateTransaction = db.transaction(() => {
      db.prepare(`
        UPDATE comics
        SET title = ?, slug = ?, description = ?, genre = ?, score = ?, reads = ?, rank = ?, is_original = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(title, slug, description, genre, score, reads, rank, is_original ? 1 : 0, id);

      // Reset creators
      db.prepare("DELETE FROM comic_creators WHERE comic_id = ?").run(id);

      const insertComicCreator = db.prepare(`
        INSERT INTO comic_creators (comic_id, creator_id)
        VALUES (?, ?)
      `);

      for (const creatorId of creatorIds) {
        insertComicCreator.run(id, creatorId);
      }
    });

    updateTransaction();

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
    // cascades because of ON DELETE CASCADE in SQLite
    const result = db.prepare("DELETE FROM comics WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
