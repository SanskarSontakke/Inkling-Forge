import db from "./db";

/**
 * Uploads a file buffer to the public Supabase Storage bucket 'inklingforge'.
 * Returns the public URL of the uploaded object.
 */
export async function uploadToStorage(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<string> {
  // Clean up leading slashes to prevent issues in bucket pathing
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

  const { data, error } = await db.storage
    .from("inklingforge")
    .upload(cleanPath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = db.storage
    .from("inklingforge")
    .getPublicUrl(cleanPath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error(`Failed to get public URL for path: ${cleanPath}`);
  }

  return publicUrlData.publicUrl;
}
