import { NextRequest, NextResponse } from "next/server";
import { compareCredentials, checkRateLimit, signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Get IP address for rate limiting
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  
  const rateLimitStatus = checkRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    const retryAfter = rateLimitStatus.resetTime 
      ? Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000) 
      : 60;
    return NextResponse.json(
      { error: `Too many login attempts. Please try again in ${retryAfter} seconds.` },
      { 
        status: 429,
        headers: { "Retry-After": String(retryAfter) }
      }
    );
  }

  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "cB4kR9mPxQ2nW7vL8yJ5tH3bF6dA1sG";
    const expectedPassword = process.env.ADMIN_PASSWORD || "zX9wE2cR5vT8bN3mK6pQ1jL4hY7fU0gD";

    const userValid = compareCredentials(username, expectedUsername);
    const passValid = compareCredentials(password, expectedPassword);

    if (!userValid || !passValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const token = signToken({ username: expectedUsername });

    // Set cookie
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
