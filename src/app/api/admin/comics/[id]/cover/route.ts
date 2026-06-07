import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import fs from "fs";
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
    const isBanner = formData.get("isBanner") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
    fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".webp";
    const filename = `${id}-${isBanner ? "banner" : "cover"}-${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const relativePath = `/uploads/covers/${filename}`;

    if (isBanner) {
      db.prepare("UPDATE comics SET banner_image = ?, updated_at = datetime('now') WHERE id = ?").run(relativePath, id);
    } else {
      db.prepare("UPDATE comics SET cover_image = ?, updated_at = datetime('now') WHERE id = ?").run(relativePath, id);
    }

    return NextResponse.json({ success: true, path: relativePath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
