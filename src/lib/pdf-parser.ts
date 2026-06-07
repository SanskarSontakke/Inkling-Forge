import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { uploadToStorage } from "./storage";

interface ParsedPage {
  pageNumber: number;
  imagePath: string;
  width: number;
  height: number;
  fileSize: number;
}

export async function parsePdfToWebp(pdfBuffer: Buffer, episodeId: string): Promise<ParsedPage[]> {
  const tempDir = path.join(os.tmpdir(), `pdf-${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const tempPdfPath = path.join(tempDir, "source.pdf");
  fs.writeFileSync(tempPdfPath, pdfBuffer);

  const parsedPages: ParsedPage[] = [];

  try {
    console.log(`Running pdftoppm on ${tempPdfPath}...`);
    // Extract pages as JPEGs at 150 DPI, pre-scaled to fit in a 2000px box.
    const pagePrefix = path.join(tempDir, "page");
    execSync(`pdftoppm -jpeg -scale-to 2000 -r 150 "${tempPdfPath}" "${pagePrefix}"`);

    // Find all generated page-*.jpg files
    const files = fs.readdirSync(tempDir);
    const jpgFiles = files.filter(f => f.startsWith("page-") && (f.endsWith(".jpg") || f.endsWith(".jpeg")));

    // Sort files naturally by extracting page number from name
    const sortedJpgFiles = jpgFiles.map(filename => {
      const match = filename.match(/page-(\d+)\.(jpg|jpeg)/);
      const pageNumber = match ? parseInt(match[1], 10) : 0;
      return { filename, pageNumber };
    }).sort((a, b) => a.pageNumber - b.pageNumber);

    console.log(`Converting and uploading ${sortedJpgFiles.length} pages to Supabase Storage...`);

    // Process each image sequentially to avoid CPU spikes
    for (let i = 0; i < sortedJpgFiles.length; i++) {
      const { filename, pageNumber } = sortedJpgFiles[i];
      const sourceJpgPath = path.join(tempDir, filename);

      const targetFilename = `page-${pageNumber}.webp`;

      // Perform conversion and optimization using sharp
      const imageProcessor = sharp(sourceJpgPath);
      const metadata = await imageProcessor.metadata();
      
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      const webpBuffer = await imageProcessor
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      // Upload WebP buffer to storage
      const storagePath = `episodes/${episodeId}/${targetFilename}`;
      const publicUrl = await uploadToStorage(webpBuffer, storagePath, "image/webp");

      parsedPages.push({
        pageNumber,
        imagePath: publicUrl,
        width,
        height,
        fileSize: webpBuffer.length
      });
    }

    console.log(`Successfully processed and uploaded ${parsedPages.length} pages.`);
  } catch (error) {
    console.error("Error in PDF parsing/uploading pipeline:", error);
    throw error;
  } finally {
    // Clean up temporary directory
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error("Failed to clean up temp directory:", cleanupError);
    }
  }

  return parsedPages;
}
