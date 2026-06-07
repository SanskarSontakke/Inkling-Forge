import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: creators, error } = await db
      .from("creators")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

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
    
    // Fetch all existing creator IDs starting with this baseId in one query to prevent HTTP loop roundtrips
    const { data: existingCreators, error: checkError } = await db
      .from("creators")
      .select("id")
      .like("id", `${baseId}%`);

    if (checkError) throw checkError;

    const idSet = new Set((existingCreators || []).map(c => c.id));
    let id = baseId;
    let counter = 1;
    
    while (idSet.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    const { error: insertError } = await db.from("creators").insert({
      id,
      name,
      role,
      bio,
      followers,
      reads,
      twitter,
      instagram,
      artstation
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
