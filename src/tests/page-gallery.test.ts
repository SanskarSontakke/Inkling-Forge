import test from "node:test";
import assert from "node:assert";
import db from "../lib/db";

test("Database Pages Schema and original_page_number Test", () => {
  // Check if original_page_number exists in pages table metadata
  const columns = db.prepare("PRAGMA table_info(pages)").all();
  const originalPageNumCol = columns.find((c: any) => c.name === "original_page_number");
  
  assert.ok(originalPageNumCol, "original_page_number column should exist in the pages table");
  assert.strictEqual(originalPageNumCol.type, "INTEGER", "original_page_number column type should be INTEGER");
});

test("Pages Reordering and Resetting Database Flow Test", () => {
  // Find a test episode that has multiple pages
  const episode = db.prepare("SELECT id FROM episodes LIMIT 1").get();
  assert.ok(episode, "Should find at least one episode in the database");
  const episodeId = episode.id;

  // Fetch initial pages ordered by page_number
  const initialPages = db.prepare(`
    SELECT id, page_number, original_page_number
    FROM pages
    WHERE episode_id = ?
    ORDER BY page_number ASC
  `).all(episodeId);

  // If there are less than 2 pages, we insert mock pages for testing
  if (initialPages.length < 2) {
    db.prepare("DELETE FROM pages WHERE episode_id = ?").run(episodeId);
    const insertPage = db.prepare(`
      INSERT INTO pages (id, episode_id, page_number, original_page_number, image_path)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertPage.run("test-page-1", episodeId, 1, 1, "test-path-1");
    insertPage.run("test-page-2", episodeId, 2, 2, "test-path-2");
    insertPage.run("test-page-3", episodeId, 3, 3, "test-path-3");
  }

  // Refetch pages
  const pages = db.prepare(`
    SELECT id, page_number, original_page_number
    FROM pages
    WHERE episode_id = ?
    ORDER BY page_number ASC
  `).all(episodeId);

  assert.ok(pages.length >= 2, "Test episode should have at least 2 pages for reordering tests");

  // Verify that initially page_number matches original_page_number
  pages.forEach((p: any) => {
    assert.strictEqual(p.page_number, p.original_page_number, `Initial page ${p.id} page_number should match original_page_number`);
  });

  // Reorder test: Swap the first two pages
  const pageIds = pages.map((p: any) => p.id);
  const temp = pageIds[0];
  pageIds[0] = pageIds[1];
  pageIds[1] = temp;

  // Run the transactional reorder logic
  const updateTransaction = db.transaction(() => {
    const updateStmt = db.prepare("UPDATE pages SET page_number = ? WHERE id = ? AND episode_id = ?");
    pageIds.forEach((pageId: string, idx: number) => {
      updateStmt.run(idx + 1, pageId, episodeId);
    });
  });
  updateTransaction();

  // Fetch pages again to check new order
  const reorderedPages = db.prepare(`
    SELECT id, page_number, original_page_number
    FROM pages
    WHERE episode_id = ?
    ORDER BY page_number ASC
  `).all(episodeId);

  // Verify the pages were swapped successfully
  assert.strictEqual(reorderedPages[0].id, pages[1].id, "First page in reordered list should be the previously second page");
  assert.strictEqual(reorderedPages[1].id, pages[0].id, "Second page in reordered list should be the previously first page");

  // Verify page_number is updated but original_page_number is unchanged
  assert.strictEqual(reorderedPages[0].page_number, 1, "New first page page_number should be 1");
  assert.strictEqual(reorderedPages[0].original_page_number, pages[1].original_page_number, "New first page original_page_number should not change");
  assert.strictEqual(reorderedPages[1].page_number, 2, "New second page page_number should be 2");
  assert.strictEqual(reorderedPages[1].original_page_number, pages[0].original_page_number, "New second page original_page_number should not change");

  // Reset test: Restore order to original
  const resetTransaction = db.transaction(() => {
    db.prepare("UPDATE pages SET page_number = original_page_number WHERE episode_id = ?").run(episodeId);
  });
  resetTransaction();

  // Fetch pages again to verify restore
  const resetPages = db.prepare(`
    SELECT id, page_number, original_page_number
    FROM pages
    WHERE episode_id = ?
    ORDER BY page_number ASC
  `).all(episodeId);

  // Verify pages are back in original sequence
  assert.strictEqual(resetPages[0].id, pages[0].id, "First page after reset should match original first page");
  assert.strictEqual(resetPages[1].id, pages[1].id, "Second page after reset should match original second page");

  resetPages.forEach((p: any) => {
    assert.strictEqual(p.page_number, p.original_page_number, `After reset, page ${p.id} page_number should match original_page_number`);
  });
});
