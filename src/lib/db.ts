import { createClient } from "@supabase/supabase-js";
import { MOCK_COMICS, MOCK_CREATORS } from "../data/comics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

// Create a server-side Supabase client with service role key (or publishable key as fallback)
export const db = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Seed function to import mock data if the database is empty
export async function seedSupabaseDatabase() {
  console.log("Checking if Supabase database needs seeding...");
  try {
    const [
      { count: comicsCount, error: cErr },
      { count: creatorsCount, error: crErr }
    ] = await Promise.all([
      db.from("comics").select("*", { count: "exact", head: true }),
      db.from("creators").select("*", { count: "exact", head: true })
    ]);

    if (cErr || crErr) {
      console.error("Error checking database count for seed:", cErr || crErr);
      return;
    }

    if (comicsCount && comicsCount >= 7 && creatorsCount && creatorsCount >= 5) {
      console.log("Supabase database is already seeded.");
      return;
    }

    console.log("Seeding Supabase database from mock data...");

    // 1. Seed creators
    const creatorsToInsert = Object.values(MOCK_CREATORS).map((creator: any) => ({
      id: creator.id,
      name: creator.name,
      role: creator.role || "",
      bio: creator.bio || "",
      avatar: creator.avatar || "",
      followers: creator.followers || "0",
      reads: creator.reads || "0",
      twitter: creator.socials?.twitter || "",
      instagram: creator.socials?.instagram || "",
      artstation: creator.socials?.artstation || "",
    }));

    const { error: creatorsError } = await db.from("creators").upsert(creatorsToInsert);
    if (creatorsError) {
      throw new Error(`Failed to seed creators: ${creatorsError.message}`);
    }
    console.log(`Seeded ${creatorsToInsert.length} creators.`);

    // 2. Seed comics, episodes, pages, and creator mapping
    for (let comicIdx = 0; comicIdx < MOCK_COMICS.length; comicIdx++) {
      const comic = MOCK_COMICS[comicIdx];
      const isTrending = comicIdx < 4;
      const trendingRank = isTrending ? comicIdx + 1 : 0;

      console.log(`Seeding comic: ${comic.title}...`);

      const { error: comicError } = await db.from("comics").upsert({
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        description: comic.description || "",
        genre: comic.genre || "Action",
        score: comic.score || "0.0",
        reads: comic.reads || "0",
        rank: comic.rank || "",
        cover_image: comic.coverImage || "",
        banner_image: comic.bannerImage || "",
        is_original: !!comic.isOriginal,
        is_trending: isTrending,
        trending_rank: trendingRank,
      });

      if (comicError) {
        console.error(`Failed to insert comic ${comic.title}:`, comicError);
        continue;
      }

      // Insert comic creators relation
      if (comic.creatorIds && Array.isArray(comic.creatorIds)) {
        const comicCreators = comic.creatorIds.map((creatorId: string) => ({
          comic_id: comic.id,
          creator_id: creatorId,
        }));
        await db.from("comic_creators").upsert(comicCreators);
      }

      // Insert episodes & pages
      if (comic.chapters && Array.isArray(comic.chapters)) {
        for (let chapterIdx = 0; chapterIdx < comic.chapters.length; chapterIdx++) {
          const chapter = comic.chapters[chapterIdx];
          const episodeId = `${comic.id}-${chapter.id}`;

          let epNum = comic.chapters.length - chapterIdx;
          const numMatch = chapter.id.match(/\d+/);
          if (numMatch) {
            epNum = parseInt(numMatch[0], 10);
          }

          const { error: epError } = await db.from("episodes").upsert({
            id: episodeId,
            comic_id: comic.id,
            title: chapter.title,
            description: "",
            episode_number: epNum,
            cover_image: comic.coverImage || "",
          });

          if (epError) {
            console.error(`Failed to insert episode ${chapter.title}:`, epError);
            continue;
          }

          if (chapter.panels && Array.isArray(chapter.panels)) {
            const pagesToInsert = chapter.panels.map((panelUrl: string, panelIdx: number) => ({
              id: `${episodeId}-p-${panelIdx + 1}`,
              episode_id: episodeId,
              page_number: panelIdx + 1,
              original_page_number: panelIdx + 1,
              image_path: panelUrl,
              width: 0,
              height: 0,
              file_size: 0,
            }));

            const { error: pagesError } = await db.from("pages").upsert(pagesToInsert);
            if (pagesError) {
              console.error(`Failed to insert pages for episode ${chapter.title}:`, pagesError);
            }
          }
        }
      }
    }

    console.log("Database successfully seeded!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

export default db;
