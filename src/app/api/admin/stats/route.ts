import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db, { seedSupabaseDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if database needs seeding, and seed if empty
    const { count: initialComicsCount, error: countError } = await db
      .from("comics")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    if (initialComicsCount === 0) {
      await seedSupabaseDatabase();
    }

    // Run parallel count and query calls to Supabase
    const [
      { count: totalComics },
      { count: totalEpisodes },
      { count: totalPages },
      { count: totalCreators },
      { data: recentComics },
      { data: recentCreators }
    ] = await Promise.all([
      db.from("comics").select("*", { count: "exact", head: true }),
      db.from("episodes").select("*", { count: "exact", head: true }),
      db.from("pages").select("*", { count: "exact", head: true }),
      db.from("creators").select("*", { count: "exact", head: true }),
      db.from("comics").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(3),
      db.from("creators").select("id, name, updated_at").order("updated_at", { ascending: false }).limit(3)
    ]);

    // Format recent activity
    const recentActivity = [
      ...(recentComics || []).map(c => ({ id: c.id, title: c.title, updated_at: c.updated_at, type: "comic" })),
      ...(recentCreators || []).map(cr => ({ id: cr.id, title: cr.name, updated_at: cr.updated_at, type: "creator" }))
    ]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalComics: totalComics || 0,
        totalEpisodes: totalEpisodes || 0,
        totalPages: totalPages || 0,
        totalCreators: totalCreators || 0
      },
      recentActivity
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}
