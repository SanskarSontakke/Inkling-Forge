import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback-secret-for-dev-only-change-in-env";
const COOKIE_NAME = "admin_token";

interface RateLimit {
  attempts: number;
  lockoutUntil: number;
  windowStart: number;
}
const rateLimits = new Map<string, RateLimit>();

export function compareCredentials(input: string, secret: string): boolean {
  if (!input || !secret) return false;
  const inputBuffer = Buffer.from(input, "utf-8");
  const secretBuffer = Buffer.from(secret, "utf-8");
  if (inputBuffer.length !== secretBuffer.length) {
    // Still run comparison on itself to maintain timing characteristics
    crypto.timingSafeEqual(secretBuffer, secretBuffer);
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, secretBuffer);
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const now = Date.now();
  let limit = rateLimits.get(ip);

  // If locked out, check if lock has expired
  if (limit && limit.lockoutUntil > 0) {
    if (now < limit.lockoutUntil) {
      return { allowed: false, remaining: 0, resetTime: limit.lockoutUntil };
    } else {
      // Lock has expired, reset limit
      rateLimits.delete(ip);
      limit = undefined;
    }
  }

  // If window has expired (1 minute), reset attempts
  if (limit && now - limit.windowStart > 60 * 1000) {
    rateLimits.delete(ip);
    limit = undefined;
  }

  if (!limit) {
    limit = { attempts: 0, lockoutUntil: 0, windowStart: now };
  }

  limit.attempts += 1;

  // Max 5 attempts per minute, lock out for 15 minutes on 10th failure in short period
  if (limit.attempts > 10) {
    limit.lockoutUntil = now + 15 * 60 * 1000; // 15 min lockout
    rateLimits.set(ip, limit);
    return { allowed: false, remaining: 0, resetTime: limit.lockoutUntil };
  }

  if (limit.attempts > 5 && limit.lockoutUntil === 0) {
    // Soft block if they do more than 5 attempts per minute
    return { allowed: false, remaining: 0, resetTime: now + 60 * 1000 };
  }

  rateLimits.set(ip, limit);
  return { allowed: true, remaining: 5 - limit.attempts };
}

export function signToken(payload: { username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string };
  } catch (error) {
    return null;
  }
}

export { COOKIE_NAME };
