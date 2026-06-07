import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const { data: comic, error: comicError } = await db
      .from("comics")
      .select("*, comic_creators(creator_id)")
      .eq("slug", slug)
      .maybeSingle();

    if (comicError) throw comicError;
    if (!comic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    // Get creators
    let creators: any[] = [];
    const creatorIds = comic.comic_creators ? comic.comic_creators.map((cc: any) => cc.creator_id) : [];
    if (creatorIds.length > 0) {
      const { data: fetchedCreators, error: creatorsError } = await db
        .from("creators")
        .select("*")
        .in("id", creatorIds);
      if (creatorsError) throw creatorsError;
      creators = fetchedCreators || [];
    }

    // Get episodes
    const { data: episodes, error: episodesError } = await db
      .from("episodes")
      .select("*")
      .eq("comic_id", comic.id)
      .order("episode_number", { ascending: true });

    if (episodesError) throw episodesError;

    // Get all pages for these episodes in a single optimized query
    const episodeIds = episodes ? episodes.map((ep: any) => ep.id) : [];
    const pagesByEpisode: Record<string, string[]> = {};
    
    if (episodeIds.length > 0) {
      const { data: pages, error: pagesError } = await db
        .from("pages")
        .select("episode_id, image_path")
        .in("episode_id", episodeIds)
        .order("page_number", { ascending: true });

      if (pagesError) throw pagesError;

      // Group pages by episode_id
      pages?.forEach((p: any) => {
        if (!pagesByEpisode[p.episode_id]) {
          pagesByEpisode[p.episode_id] = [];
        }
        pagesByEpisode[p.episode_id].push(p.image_path);
      });
    }

    // For each episode, get panels from grouped pages map
    const chapters = (episodes || []).map((ep: any) => ({
      id: ep.id,
      title: ep.title,
      description: ep.description || "",
      episode_number: ep.episode_number,
      coverImage: ep.cover_image,
      panels: pagesByEpisode[ep.id] || []
    }));

    const formattedComic = {
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      genre: comic.genre,
      reads: comic.reads,
      score: comic.score,
      rank: comic.rank,
      isOriginal: !!comic.is_original,
      coverImage: comic.cover_image,
      bannerImage: comic.banner_image,
      description: comic.description,
      creatorIds,
      chapters
    };

    return NextResponse.json({ comic: formattedComic, creators });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
