import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { parsePdfToWebp } from "@/lib/pdf-parser";
import fs from "fs";
import path from "path";

// Set maximum body limit: 100MB
export const maxDuration = 300; // Allow up to 5 minutes for processing large PDFs

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: episodeId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Verify file size limit (100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF size exceeds the 100MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delete existing files in uploads/episodes/{episodeId}
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "episodes", episodeId);
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }

    // Process PDF
    const parsedPages = await parsePdfToWebp(buffer, episodeId);

    // Update Database
    const updateDbTransaction = db.transaction(() => {
      // 1. Delete existing database entries for pages
      db.prepare("DELETE FROM pages WHERE episode_id = ?").run(episodeId);

      // 2. Insert new pages
      const insertPage = db.prepare(`
        INSERT INTO pages (id, episode_id, page_number, original_page_number, image_path, width, height, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      parsedPages.forEach(page => {
        const pageId = `${episodeId}-p-${page.pageNumber}`;
        insertPage.run(
          pageId,
          episodeId,
          page.pageNumber,
          page.pageNumber, // original_page_number
          page.imagePath,
          page.width,
          page.height,
          page.fileSize
        );
      });

      // 3. Update episode updated_at timestamp
      db.prepare("UPDATE episodes SET updated_at = datetime('now') WHERE id = ?").run(episodeId);
    });

    updateDbTransaction();

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded and parsed ${parsedPages.length} pages.`,
      pages: parsedPages
    });
  } catch (error: any) {
    console.error("PDF upload/parsing error:", error);
    return NextResponse.json({ error: "Failed to parse PDF: " + error.message }, { status: 500 });
  }
}
