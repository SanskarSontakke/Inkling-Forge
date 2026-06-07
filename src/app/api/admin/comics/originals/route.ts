import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function PUT(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalIds = [] } = await req.json();

    if (!Array.isArray(originalIds)) {
      return NextResponse.json({ error: "originalIds must be an array" }, { status: 400 });
    }

    // 1. Reset all to false
    const { error: resetError } = await db
      .from("comics")
      .update({ is_original: false });

    if (resetError) throw resetError;

    // 2. Set selected to true
    if (originalIds.length > 0) {
      const { error: setError } = await db
        .from("comics")
        .update({ is_original: true, updated_at: new Date().toISOString() })
        .in("id", originalIds);

      if (setError) throw setError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
