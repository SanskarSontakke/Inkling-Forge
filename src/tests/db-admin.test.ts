import test from "node:test";
import assert from "node:assert";
import db from "../lib/db";
import { compareCredentials, checkRateLimit, signToken, verifyToken } from "../lib/auth";

test("Database Tables Existence Test", () => {
  // Check that all tables exist in SQLite database
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('comics', 'episodes', 'pages', 'creators', 'comic_creators')
  `).all().map((row: any) => row.name);

  assert.strictEqual(tables.includes("comics"), true, "comics table should exist");
  assert.strictEqual(tables.includes("episodes"), true, "episodes table should exist");
  assert.strictEqual(tables.includes("pages"), true, "pages table should exist");
  assert.strictEqual(tables.includes("creators"), true, "creators table should exist");
  assert.strictEqual(tables.includes("comic_creators"), true, "comic_creators table should exist");
});

test("Seeded Data Integrity Test", () => {
  // Verify creators row count
  const creatorsCount = db.prepare("SELECT COUNT(*) as count FROM creators").get().count;
  assert.ok(creatorsCount >= 5, "Should have seeded at least 5 creators");

  // Verify comics row count
  const comicsCount = db.prepare("SELECT COUNT(*) as count FROM comics").get().count;
  assert.ok(comicsCount >= 7, "Should have seeded at least 7 comics");

  // Verify episodes row count
  const episodesCount = db.prepare("SELECT COUNT(*) as count FROM episodes").get().count;
  assert.ok(episodesCount >= 9, "Should have seeded mock episodes");

  // Verify pages row count
  const pagesCount = db.prepare("SELECT COUNT(*) as count FROM pages").get().count;
  assert.ok(pagesCount >= 9, "Should have seeded mock pages");
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
