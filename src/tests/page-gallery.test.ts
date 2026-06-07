import test from "node:test";
import assert from "node:assert";
import db, { seedSupabaseDatabase } from "../lib/db";

test("Database Pages Schema and original_page_number Test", async () => {
  // Ensure the database is seeded for tests
  await seedSupabaseDatabase();

  const { data, error } = await db.from("pages").select("original_page_number").limit(1);
  assert.strictEqual(error, null, "Querying original_page_number from pages should succeed");
  if (data && data.length > 0) {
    assert.strictEqual(typeof data[0].original_page_number, "number", "original_page_number column type should be number (integer)");
  }
});

test("Pages Reordering and Resetting Database Flow Test", async () => {
  // Find a test episode that has pages
  const { data: episodes, error: epError } = await db.from("episodes").select("id").limit(1);
  assert.strictEqual(epError, null);
  assert.ok(episodes && episodes.length > 0, "Should find at least one episode in the database");
  const episodeId = episodes[0].id;

  // Fetch initial pages ordered by page_number
  const { data: initialPages, error: pError } = await db
    .from("pages")
    .select("id, page_number, original_page_number")
    .eq("episode_id", episodeId)
    .order("page_number", { ascending: true });

  assert.strictEqual(pError, null);

  // If there are less than 2 pages, we insert mock pages for testing
  let pages = initialPages || [];
  if (pages.length < 2) {
    // Delete existing
    await db.from("pages").delete().eq("episode_id", episodeId);
    
    // Insert mock
    const { error: insError } = await db.from("pages").insert([
      { id: "test-page-1", episode_id: episodeId, page_number: 1, original_page_number: 1, image_path: "test-path-1" },
      { id: "test-page-2", episode_id: episodeId, page_number: 2, original_page_number: 2, image_path: "test-path-2" },
      { id: "test-page-3", episode_id: episodeId, page_number: 3, original_page_number: 3, image_path: "test-path-3" }
    ]);
    assert.strictEqual(insError, null);

    // Refetch
    const { data: refetchedPages, error: refError } = await db
      .from("pages")
      .select("id, page_number, original_page_number")
      .eq("episode_id", episodeId)
      .order("page_number", { ascending: true });
    assert.strictEqual(refError, null);
    pages = refetchedPages || [];
  }

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

  // Run the concurrent reorder logic
  const updatePromises = pageIds.map((pageId: string, idx: number) => {
    return db
      .from("pages")
      .update({ page_number: idx + 1 })
      .eq("id", pageId)
      .eq("episode_id", episodeId);
  });
  const results = await Promise.all(updatePromises);
  for (const res of results) {
    assert.strictEqual(res.error, null, "Update statement should not throw error");
  }

  // Fetch pages again to check new order
  const { data: reorderedPages, error: reError } = await db
    .from("pages")
    .select("id, page_number, original_page_number")
    .eq("episode_id", episodeId)
    .order("page_number", { ascending: true });

  assert.strictEqual(reError, null);
  assert.ok(reorderedPages);

  // Verify the pages were swapped successfully
  assert.strictEqual(reorderedPages[0].id, pages[1].id, "First page in reordered list should be the previously second page");
  assert.strictEqual(reorderedPages[1].id, pages[0].id, "Second page in reordered list should be the previously first page");

  // Verify page_number is updated but original_page_number is unchanged
  assert.strictEqual(reorderedPages[0].page_number, 1, "New first page page_number should be 1");
  assert.strictEqual(reorderedPages[0].original_page_number, pages[1].original_page_number, "New first page original_page_number should not change");
  assert.strictEqual(reorderedPages[1].page_number, 2, "New second page page_number should be 2");
  assert.strictEqual(reorderedPages[1].original_page_number, pages[0].original_page_number, "New second page original_page_number should not change");

  // Reset test: Restore order to original
  const { data: resetPagesList, error: resetFetchError } = await db
    .from("pages")
    .select("id, original_page_number")
    .eq("episode_id", episodeId);
  
  assert.strictEqual(resetFetchError, null);
  assert.ok(resetPagesList);

  const resetPromises = resetPagesList.map((p: any) => {
    return db
      .from("pages")
      .update({ page_number: p.original_page_number })
      .eq("id", p.id)
      .eq("episode_id", episodeId);
  });
  await Promise.all(resetPromises);

  // Fetch pages again to verify restore
  const { data: resetPages, error: restoreError } = await db
    .from("pages")
    .select("id, page_number, original_page_number")
    .eq("episode_id", episodeId)
    .order("page_number", { ascending: true });

  assert.strictEqual(restoreError, null);
  assert.ok(resetPages);

  // Verify pages are back in original sequence
  assert.strictEqual(resetPages[0].id, pages[0].id, "First page after reset should match original first page");
  assert.strictEqual(resetPages[1].id, pages[1].id, "Second page after reset should match original second page");

  resetPages.forEach((p: any) => {
    assert.strictEqual(p.page_number, p.original_page_number, `After reset, page ${p.id} page_number should match original_page_number`);
  });
});
