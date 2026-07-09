# Inkling Forge

> A webcomics and sequential art platform with a drag-and-drop page editor and PDF upload pipeline.

## What it does

Inkling Forge lets creators upload PDFs, extract pages as images, reorder them in an interactive editor, and publish them as webcomics. It includes an admin dashboard with authentication, activity logging, and trending controls. Readers browse comics through a Neubrutalist-styled interface with light/dark theme toggle and an immersion reader for sequential browsing.

## Why I built it

This is a full-stack learning project exploring Next.js 16, React 19, database integration (Supabase), authentication patterns, and image processing at scale. The goal was to understand how modern web apps handle file uploads, transactional database updates, and responsive drag-and-drop UIs.

## Tech stack

- **Framework:** Next.js 16.2, React 19, TypeScript
- **Styling:** TailwindCSS v4
- **Database:** Supabase (PostgreSQL)
- **Image Processing:** Sharp, Poppler (`pdftoppm`)
- **Drag & Drop:** @dnd-kit
- **Auth:** JWT-based sessions

## Getting started

```bash
git clone https://github.com/SanskarSontakke/Inkling-Forge.git
cd Inkling-Forge
npm install
```

Create `.env.local`:
```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
JWT_SECRET=your_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Start the development server:
```bash
npm run dev
```

Open http://localhost:3000. The app initializes sample data on first run.

## How it works

**PDF Upload Pipeline:** Users upload PDFs; the server extracts pages using `pdftoppm` and compresses them with Sharp into WebP format.

**Page Reordering:** The drag-and-drop editor (powered by @dnd-kit) allows real-time page reordering with database persistence and a "Reset to PDF Order" button.

**Admin Dashboard:** Secured with HTTP-only JWT cookies, rate-limiting (5 soft attempts, 10 attempts = 15-min lockout), and timing-safe credential comparison to prevent side-channel attacks.

**Public Reader:** Tabbed interface (Popular, Creators, Originals) with theme switching and an immersion-reader mode for continuous reading.

## Results / status

Working demo. Core features (upload, reorder, publish, read) are functional. Database migrations to Supabase completed. See `/src/tests/*.test.ts` for unit test coverage on auth, rate-limiting, and page reordering.

Run tests:
```bash
npx tsx --test src/tests/*.test.ts
```

Build and run production:
```bash
npm run build
npm run start
```

## License

MIT © 2026 Sanskar Sontakke
