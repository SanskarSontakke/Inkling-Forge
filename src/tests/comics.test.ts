import test from "node:test";
import assert from "node:assert";
import { MOCK_COMICS, MOCK_CREATORS } from "../data/comics";

test("Database Integrity Test", () => {
  assert.ok(MOCK_COMICS.length > 0, "MOCK_COMICS should contain data");
  assert.ok(Object.keys(MOCK_CREATORS).length > 0, "MOCK_CREATORS should contain data");
});

test("Search Filtering Match Matrix", () => {
  const query = "neon";
  const results = MOCK_COMICS.filter(
    (c) =>
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.genre.toLowerCase().includes(query)
  );

  assert.ok(results.length > 0, "Should find matching comics for query 'neon'");
  
  // Verify matching criteria
  for (const comic of results) {
    const isMatched =
      comic.title.toLowerCase().includes(query) ||
      comic.description.toLowerCase().includes(query) ||
      comic.genre.toLowerCase().includes(query);
    assert.strictEqual(isMatched, true, `Comic ${comic.title} must match query 'neon'`);
  }
});

test("Genre Category Filters", () => {
  const genre = "Action";
  const actionComics = MOCK_COMICS.filter((c) => c.genre === genre);

  assert.ok(actionComics.length > 0, "Should find Action category comics");
  for (const comic of actionComics) {
    assert.strictEqual(comic.genre, genre, `Comic ${comic.title} genre must be Action`);
  }
});

test("Original Series Filtering", () => {
  const originals = MOCK_COMICS.filter((c) => c.isOriginal);

  assert.ok(originals.length > 0, "Should find exclusive originals series");
  for (const comic of originals) {
    assert.strictEqual(comic.isOriginal, true, `Comic ${comic.title} must be marked isOriginal`);
  }
});

test("Creators Mapping Integrity", () => {
  for (const comic of MOCK_COMICS) {
    for (const creatorId of comic.creatorIds) {
      const creator = MOCK_CREATORS[creatorId];
      assert.ok(
        creator,
        `Creator ${creatorId} linked in comic ${comic.title} must exist in MOCK_CREATORS`
      );
    }
  }
});
