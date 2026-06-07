import test from "node:test";
import assert from "node:assert";
import db, { seedSupabaseDatabase } from "../lib/db";
import { compareCredentials, checkRateLimit, signToken, verifyToken } from "../lib/auth";

test("Database Tables Existence Test", async () => {
  // Ensure the database is seeded for tests
  await seedSupabaseDatabase();

  // Query 1 row from each table to ensure they exist and are accessible in Supabase
  const tables = ["comics", "episodes", "pages", "creators", "comic_creators"];
  for (const table of tables) {
    const { error } = await db.from(table).select("*").limit(1);
    assert.strictEqual(error, null, `Table ${table} should exist and be queryable in Supabase`);
  }
});

test("Seeded Data Integrity Test", async () => {
  // Verify creators row count
  const { count: creatorsCount, error: creatorsError } = await db
    .from("creators")
    .select("*", { count: "exact", head: true });
  assert.strictEqual(creatorsError, null);
  assert.ok((creatorsCount || 0) >= 5, "Should have seeded at least 5 creators");

  // Verify comics row count
  const { count: comicsCount, error: comicsError } = await db
    .from("comics")
    .select("*", { count: "exact", head: true });
  assert.strictEqual(comicsError, null);
  assert.ok((comicsCount || 0) >= 7, "Should have seeded at least 7 comics");

  // Verify episodes row count
  const { count: episodesCount, error: episodesError } = await db
    .from("episodes")
    .select("*", { count: "exact", head: true });
  assert.strictEqual(episodesError, null);
  assert.ok((episodesCount || 0) >= 9, "Should have seeded mock episodes");

  // Verify pages row count
  const { count: pagesCount, error: pagesError } = await db
    .from("pages")
    .select("*", { count: "exact", head: true });
  assert.strictEqual(pagesError, null);
  assert.ok((pagesCount || 0) >= 9, "Should have seeded mock pages");
});

test("Timing-Safe Credentials Comparison Test", () => {
  const adminUser = "cB4kR9mPxQ2nW7vL8yJ5tH3bF6dA1sG";
  const wrongUser = "wrong-admin-username";

  // Test match
  assert.strictEqual(compareCredentials(adminUser, adminUser), true, "Identical strings should match");
  
  // Test mismatch
  assert.strictEqual(compareCredentials(wrongUser, adminUser), false, "Mismatched strings should not match");
  
  // Test empty values
  assert.strictEqual(compareCredentials("", adminUser), false, "Empty input should fail");
  assert.strictEqual(compareCredentials(adminUser, ""), false, "Empty secret should fail");
});

test("Rate Limiter Functional Test", () => {
  const testIp = "192.168.1.100";
  
  // Clean checks
  let status = checkRateLimit(testIp);
  assert.strictEqual(status.allowed, true, "First check should be allowed");
  assert.ok(status.remaining >= 0, "Remaining attempts should be positive");

  // Consume attempts (rate limit soft-block threshold is 5 attempts per minute)
  for (let i = 0; i < 4; i++) {
    checkRateLimit(testIp);
  }

  // 6th check should trigger soft lockout/limitation
  status = checkRateLimit(testIp);
  assert.strictEqual(status.allowed, false, "6th check in short period should be restricted");

  // Lockout lockout threshold is 10 attempts
  for (let i = 0; i < 4; i++) {
    checkRateLimit(testIp);
  }

  // 11th attempt triggers hard 15-minute lockout
  status = checkRateLimit(testIp);
  assert.strictEqual(status.allowed, false, "11th check triggers hard lockout");
  assert.ok(status.resetTime !== undefined && status.resetTime > Date.now(), "Reset time must be set in future");
});

test("JWT Sign and Verify Round-trip Test", () => {
  const payload = { username: "test-admin" };
  const token = signToken(payload);
  
  assert.ok(token.length > 0, "Token string must be signed");

  const verified = verifyToken(token);
  assert.ok(verified !== null, "Token should be verified successfully");
  assert.strictEqual(verified!.username, payload.username, "Decoded payload username must match original");

  // Verify invalid token
  const invalidToken = token + "corrupted";
  const result = verifyToken(invalidToken);
  assert.strictEqual(result, null, "Corrupted token verification must return null");
});
