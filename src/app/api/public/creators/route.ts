import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const creators = db.prepare("SELECT * FROM creators ORDER BY name ASC").all();

    const formattedCreators = creators.map((creator: any) => ({
      id: creator.id,
      name: creator.name,
      avatar: creator.avatar,
      bio: creator.bio,
      followers: creator.followers,
      reads: creator.reads,
      role: creator.role,
      socials: {
        twitter: creator.twitter || undefined,
        instagram: creator.instagram || undefined,
        artstation: creator.artstation || undefined
      }
    }));

    return NextResponse.json({ creators: formattedCreators });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
