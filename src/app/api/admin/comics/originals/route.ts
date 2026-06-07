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

    const updateTransaction = db.transaction(() => {
      // 1. Reset all
      db.prepare("UPDATE comics SET is_original = 0").run();

      // 2. Set selected
      const setOriginal = db.prepare("UPDATE comics SET is_original = 1, updated_at = datetime('now') WHERE id = ?");
      originalIds.forEach((id: string) => {
        setOriginal.run(id);
      });
    });

    updateTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
