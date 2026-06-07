import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const comics = db.prepare(`
      SELECT c.*, GROUP_CONCAT(cc.creator_id) as creator_ids
      FROM comics c
      LEFT JOIN comic_creators cc ON c.id = cc.comic_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();

    const formattedComics = comics.map((comic: any) => ({
      ...comic,
      is_original: !!comic.is_original,
      is_trending: !!comic.is_trending,
      creatorIds: comic.creator_ids ? comic.creator_ids.split(",") : []
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

    const id = slug; // use slug as ID or generate UUID, let's use slug to match user expectations (url slug)

    // Check slug uniqueness
    const exists = db.prepare("SELECT 1 FROM comics WHERE slug = ?").get(slug);
    if (exists) {
      return NextResponse.json({ error: "A comic with this slug already exists" }, { status: 400 });
    }

    // Run in a transaction
    const insertTransaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO comics (id, title, slug, description, genre, score, reads, rank, is_original)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, slug, description, genre, score, reads, rank, is_original ? 1 : 0);

      const insertComicCreator = db.prepare(`
        INSERT INTO comic_creators (comic_id, creator_id)
        VALUES (?, ?)
      `);

      for (const creatorId of creatorIds) {
        insertComicCreator.run(id, creatorId);
      }
    });

    insertTransaction();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
