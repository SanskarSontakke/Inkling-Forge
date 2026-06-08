import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import db from "@/lib/db";
import { uploadToStorage } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminUser(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: episodeId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pageNumberStr = formData.get("pageNumber") as string | null;
    const isFirstPage = formData.get("isFirstPage") === "true";

    if (!file || !pageNumberStr) {
      return NextResponse.json({ error: "File and pageNumber are required" }, { status: 400 });
    }

    const pageNumber = parseInt(pageNumberStr, 10);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If it is the first page, delete existing pages in database and storage for this episode
    if (isFirstPage) {
      // 1. Delete database entries
      const { error: dbDelError } = await db
        .from("pages")
        .delete()
        .eq("episode_id", episodeId);

      if (dbDelError) throw dbDelError;
      
      // 2. Clear storage files
      try {
        const { data: existingFiles } = await db.storage
          .from("inklingforge")
          .list(`episodes/${episodeId}`);

        if (existingFiles && existingFiles.length > 0) {
          const pathsToDelete = existingFiles.map(f => `episodes/${episodeId}/${f.name}`);
          await db.storage.from("inklingforge").remove(pathsToDelete);
        }
      } catch (storageError) {
        console.warn("Could not clean up existing storage files:", storageError);
      }
    }

    // Upload WebP buffer to storage
    const targetFilename = `page-${pageNumber}.webp`;
    const storagePath = `episodes/${episodeId}/${targetFilename}`;
    const publicUrl = await uploadToStorage(buffer, storagePath, "image/webp");

    // Extract width and height passed from the browser canvas
    const width = parseInt(formData.get("width") as string || "0", 10);
    const height = parseInt(formData.get("height") as string || "0", 10);
    const fileSize = buffer.length;

    // Insert new page record
    const pageId = `${episodeId}-p-${pageNumber}`;
    const { error: insertError } = await db.from("pages").insert({
      id: pageId,
      episode_id: episodeId,
      page_number: pageNumber,
      original_page_number: pageNumber,
      image_path: publicUrl,
      width,
      height,
      file_size: fileSize
    });

    if (insertError) {
      throw insertError;
    }

    // Update episode updated_at timestamp
    const { error: epUpdateError } = await db
      .from("episodes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", episodeId);

    if (epUpdateError) {
      throw epUpdateError;
    }

    return NextResponse.json({
      success: true,
      page: {
        pageNumber,
        imagePath: publicUrl,
        width,
        height,
        fileSize
      }
    });
  } catch (error: any) {
    console.error("Page upload error:", error);
    return NextResponse.json({ error: "Failed to upload page: " + error.message }, { status: 500 });
  }
}
