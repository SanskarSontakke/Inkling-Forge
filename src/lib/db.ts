import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { MOCK_COMICS, MOCK_CREATORS } from "../data/comics";

// Ensure data directory exists
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const oldDbPath = path.join(dbDir, "comicblast.db");
const dbPath = path.join(dbDir, "inklingforge.db");

// Migrate old database file to new name to avoid data loss
if (fs.existsSync(oldDbPath) && !fs.existsSync(dbPath)) {
  try {
    fs.renameSync(oldDbPath, dbPath);
    console.log("Renamed database from comicblast.db to inklingforge.db");
  } catch (e) {
    console.error("Failed to rename database file:", e);
  }
}

let db: any;
if (process.env.NODE_ENV === "production") {
  db = new Database(dbPath);
} else {
  // Prevent multiple connections during hot-reloading in development
  if (!(global as any)._sqliteDb) {
    (global as any)._sqliteDb = new Database(dbPath);
  }
  db = (global as any)._sqliteDb;
}

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS comics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    genre TEXT DEFAULT 'Action',
    score TEXT DEFAULT '0.0',
    reads TEXT DEFAULT '0',
    rank TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    banner_image TEXT DEFAULT '',
    is_original INTEGER DEFAULT 0,
    is_trending INTEGER DEFAULT 0,
    trending_rank INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    comic_id TEXT NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    episode_number INTEGER NOT NULL,
    cover_image TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    original_page_number INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    file_size INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    followers TEXT DEFAULT '0',
    reads TEXT DEFAULT '0',
    twitter TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    artstation TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comic_creators (
    comic_id TEXT NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
    creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    PRIMARY KEY (comic_id, creator_id)
  );
`);

// Dynamic schema migration try-catch for backward compatibility
try {
  db.exec("ALTER TABLE pages ADD COLUMN original_page_number INTEGER DEFAULT 0");
  db.exec("UPDATE pages SET original_page_number = page_number WHERE original_page_number = 0");
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Seed function to import mock data if database is empty
function seedDatabase() {
  const comicsCount = db.prepare("SELECT COUNT(*) as count FROM comics").get().count;
  if (comicsCount > 0) {
    return; // Already seeded
  }

  console.log("Seeding database from mock data...");

  // Seed creators
  const insertCreator = db.prepare(`
    INSERT OR IGNORE INTO creators (id, name, role, bio, avatar, followers, reads, twitter, instagram, artstation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  Object.values(MOCK_CREATORS).forEach((creator: any) => {
    insertCreator.run(
      creator.id,
      creator.name,
      creator.role || "",
      creator.bio || "",
      creator.avatar || "",
      creator.followers || "0",
      creator.reads || "0",
      creator.socials?.twitter || "",
      creator.socials?.instagram || "",
      creator.socials?.artstation || ""
    );
  });

  // Seed comics, episodes, pages, and associations
  const insertComic = db.prepare(`
    INSERT OR IGNORE INTO comics (id, title, slug, description, genre, score, reads, rank, cover_image, banner_image, is_original, is_trending, trending_rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEpisode = db.prepare(`
    INSERT OR IGNORE INTO episodes (id, comic_id, title, description, episode_number, cover_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPage = db.prepare(`
    INSERT OR IGNORE INTO pages (id, episode_id, page_number, original_page_number, image_path, width, height, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertComicCreator = db.prepare(`
    INSERT OR IGNORE INTO comic_creators (comic_id, creator_id)
    VALUES (?, ?)
  `);

  MOCK_COMICS.forEach((comic: any, comicIdx: number) => {
    // Determine is_trending and trending_rank
    // Let's make the first 4 comics trending
    const isTrending = comicIdx < 4 ? 1 : 0;
    const trendingRank = isTrending ? comicIdx + 1 : 0;

    insertComic.run(
      comic.id,
      comic.title,
      comic.slug,
      comic.description || "",
      comic.genre || "Action",
      comic.score || "0.0",
      comic.reads || "0",
      comic.rank || "",
      comic.coverImage || "",
      comic.bannerImage || "",
      comic.isOriginal ? 1 : 0,
      isTrending,
      trendingRank
    );

    // Comic Creators many-to-many
    if (comic.creatorIds && Array.isArray(comic.creatorIds)) {
      comic.creatorIds.forEach((creatorId: string) => {
        insertComicCreator.run(comic.id, creatorId);
      });
    }

    // Chapters -> Episodes
    if (comic.chapters && Array.isArray(comic.chapters)) {
      comic.chapters.forEach((chapter: any, chapterIdx: number) => {
        // chapter.id is like "ch-42"
        const episodeId = `${comic.id}-${chapter.id}`;
        
        // Parse episode number
        let epNum = comic.chapters.length - chapterIdx;
        const numMatch = chapter.id.match(/\d+/);
        if (numMatch) {
          epNum = parseInt(numMatch[0], 10);
        }

        insertEpisode.run(
          episodeId,
          comic.id,
          chapter.title,
          "", // description
          epNum,
          comic.coverImage // default cover to comic's cover
        );

        // Panels -> Pages
        if (chapter.panels && Array.isArray(chapter.panels)) {
          chapter.panels.forEach((panelUrl: string, panelIdx: number) => {
            const pageId = `${episodeId}-p-${panelIdx + 1}`;
            insertPage.run(
              pageId,
              episodeId,
              panelIdx + 1,
              panelIdx + 1, // original_page_number
              panelUrl,
              0, // width
              0, // height
              0  // file_size
            );
          });
        }
      });
    }
  });

  console.log("Database successfully seeded!");
}

// Seed the database
seedDatabase();

export default db;
