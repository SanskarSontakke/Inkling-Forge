import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creators = db.prepare("SELECT * FROM creators ORDER BY created_at DESC").all();
    return NextResponse.json({ creators });
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

    // Generate unique ID based on lowercase name with hyphens
    const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let id = baseId;
    let counter = 1;
    
    // Check uniqueness and add counter if needed
    while (db.prepare("SELECT 1 FROM creators WHERE id = ?").get(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    db.prepare(`
      INSERT INTO creators (id, name, role, bio, followers, reads, twitter, instagram, artstation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, role, bio, followers, reads, twitter, instagram, artstation);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
