import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { uploadToStorage } from "@/lib/storage";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".webp";
    const filename = `ep-${id}-${uuidv4()}${ext}`;
    const storagePath = `covers/${filename}`;

    const publicUrl = await uploadToStorage(buffer, storagePath, file.type || "image/webp");

    await db
      .from("episodes")
      .update({ cover_image: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true, path: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
