import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { parsePdfToWebp } from "@/lib/pdf-parser";

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

    // Delete existing files in storage for this episode
    try {
      const { data: existingFiles } = await db.storage
        .from("inklingforge")
        .list(`episodes/${episodeId}`);

      if (existingFiles && existingFiles.length > 0) {
        const pathsToDelete = existingFiles.map(file => `episodes/${episodeId}/${file.name}`);
        await db.storage.from("inklingforge").remove(pathsToDelete);
      }
    } catch (storageError) {
      console.warn("Could not clean up existing storage files:", storageError);
    }

    // Process PDF and upload pages to Supabase Storage
    const parsedPages = await parsePdfToWebp(buffer, episodeId);

    // 1. Delete existing database entries for pages
    const { error: deleteError } = await db
      .from("pages")
      .delete()
      .eq("episode_id", episodeId);

    if (deleteError) {
      throw deleteError;
    }

    // 2. Insert new pages in bulk
    const pagesToInsert = parsedPages.map(page => ({
      id: `${episodeId}-p-${page.pageNumber}`,
      episode_id: episodeId,
      page_number: page.pageNumber,
      original_page_number: page.pageNumber, // original_page_number
      image_path: page.imagePath,
      width: page.width,
      height: page.height,
      file_size: page.fileSize
    }));

    const { error: insertError } = await db.from("pages").insert(pagesToInsert);
    if (insertError) {
      throw insertError;
    }

    // 3. Update episode updated_at timestamp
    const { error: epUpdateError } = await db
      .from("episodes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", episodeId);

    if (epUpdateError) {
      throw epUpdateError;
    }

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
