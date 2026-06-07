# 🖋️ Inkling Forge

Inkling Forge is a premium, high-performance webcomics and sequential art publishing platform. Built with a bold **Neubrutalist Day/Night design system**, it features a fully dynamic SQLite database backend, a secured admin portal, a 50x optimized PDF extraction pipeline, and an interactive drag-and-drop page editor.

---

## 🚀 Key Features

### 🎨 Design & Consumer Interface
- **Dynamic Neubrutalist Aesthetics:** Harmonious, high-contrast HSL color systems, thick borders, solid offsets, and custom micro-animations.
- **Theme Switcher:** Seamlessly switch between light and dark themes (stored in local cache for persistence).
- **Tab Transitions & Skeletons:** Premium sliding animations between *Popular*, *Creators*, and *Originals* tabs with minimum 0.5s loading skeletons.
- **Immersion Reader:** A vertical scrolling reading section with auto-hiding navigation bars, fixed scroll-controls, and quick go-to-top anchors.

### 🛡️ Admin Panel (`/admin-reserved`)
- **Secure Authentication:** Cookie-based HTTP-only session tokens powered by signed JWTs.
- **Timing-Safe Protection:** Uses crypto timing-safe comparison tools to prevent side-channel username/password mining attacks.
- **Brute-Force Rate Limiter:** Advanced IP-tracking rate limiter that enforces a soft limitation after 5 attempts and a hard 15-minute lockout after 10 failed logins.
- **Dashboard Overview:** Displays overall stats (total reads, creators, comics, pages) and a real-time activity log list.
- **Queue Sort Controls:** Interactive up/down sorting queues for trending charts and originals selections.

### 📑 PDF-to-WebP Extraction Pipeline
- **Poppler-Accelerated Rendering:** Uses system binary `pdftoppm` at 150 DPI to extract uploaded PDFs in under 3 seconds.
- **Poppler Pre-Scaling:** Scales images directly to `2000px` bounds during extraction, reducing temporary memory and disk overhead by 90%.
- **JPEG Intermediate Processing:** Resolves bottleneck hangs by extracting to JPEGs (300KB-500KB) instead of giant raw PNGs (10MB-20MB).
- **Direct WebP Compression:** Passes pre-scaled frames straight to `sharp` to render highly compressed, mobile-optimized WebPs (85% quality).

### 🗂️ Interactive Page Editor
- **Grid Reordering:** Drag and drop page cards to instantly reorder pages. Powered by `@dnd-kit/core` and `@dnd-kit/sortable` with a `rectSortingStrategy` for responsive multi-column layouts.
- **Smart Click/Drag Sensors:** Binds pointer constraints (8px minimum movement) to distinguish between zoom clicks and drag events.
- **Silent Background Sync:** Saving order states and resetting to PDF defaults updates database tables transactionally while preserving scroll positions (prevents layout unmounting and scroll resets).
- **Reset to PDF Order:** A "Reset Order" button becomes active when the custom sequence diverges from the original PDF sequence, allowing instant restoration.
- **Zoom Preview Modal:** Click any page to open a full-screen portal with next/prev buttons, caption stats, and keyboard support (Left/Right Arrow keys to navigate, Escape key to close).

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16.2 (Turbopack)](https://nextjs.org) (App Router, Proxy/Middleware, View Transitions)
- **Runtime & Compilation:** [React 19](https://react.dev), TypeScript, TailwindCSS v4
- **Database Engine:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite)
- **Image Processing:** [sharp](https://github.com/lovell/sharp)
- **Drag & Drop:** [@dnd-kit](https://dnd-kit.com)

---

## 📦 Installation & Local Setup

### Prerequisites
Ensure you have Node.js (v20+ recommended) and `poppler-utils` (for `pdftoppm`) installed on your system.

On Debian/Ubuntu:
```bash
sudo apt-get install poppler-utils
```

### Setup Guide
1. Clone the repository and install the dependencies:
   ```bash
   npm install
   ```

2. Configure the environment variables. Create a `.env.local` file in the root directory:
   ```env
   # Secure Admin Login Credentials (32 characters recommended)
   ADMIN_USERNAME=your_random_username_string_here
   ADMIN_PASSWORD=your_random_password_string_here
   JWT_SECRET=your_jwt_signing_secret_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application. The SQLite database (`data/inklingforge.db`) is automatically initialized and seeded with mock data on the first run.

---

## 🧪 Automated Testing

We use Node's native test runner (`node:test`) alongside `tsx` for sub-second, zero-dependency unit tests.

To run the full test suite (covering database schemas, timing-safe auth, rate limit lockouts, JWT sessions, page reordering, and PDF recovery transactions):
```bash
npx tsx --test src/tests/*.test.ts
```

---

## 🏗️ Production Build

To compile TypeScript, optimize page layouts, and generate the production bundle:
```bash
npm run build
```
To run the production bundle locally:
```bash
npm run start
```
