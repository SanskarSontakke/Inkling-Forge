import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: trendingComics, error } = await db
      .from("comics")
      .select("id, title, is_trending, trending_rank")
      .order("is_trending", { ascending: false })
      .order("trending_rank", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    const formattedList = (trendingComics || []).map((comic: any) => ({
      id: comic.id,
      title: comic.title,
      is_trending: !!comic.is_trending,
      trending_rank: comic.trending_rank
    }));

    return NextResponse.json({ comics: formattedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trendingIds = [] } = await req.json();

    if (!Array.isArray(trendingIds)) {
      return NextResponse.json({ error: "trendingIds must be an array" }, { status: 400 });
    }

    // 1. Reset all comics trending status
    const { error: resetError } = await db
      .from("comics")
      .update({ is_trending: false, trending_rank: 0 });

    if (resetError) throw resetError;

    // 2. Set new trending rankings
    if (trendingIds.length > 0) {
      const updatePromises = trendingIds.map((id: string, index: number) => {
        return db
          .from("comics")
          .update({
            is_trending: true,
            trending_rank: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);
      });

      const results = await Promise.all(updatePromises);
      for (const res of results) {
        if (res.error) throw res.error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
