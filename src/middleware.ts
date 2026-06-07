import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback-secret-for-dev-only-change-in-env";

function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function verifyJwtEdge(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const secretKeyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBin = base64UrlToUint8Array(signatureB64);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBin as any, data);
    if (!isValid) return false;

    // Decode and check expiry
    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const payload = JSON.parse(payloadJson);
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware on /admin-reserved routes
  if (pathname.startsWith("/admin-reserved")) {
    const tokenCookie = request.cookies.get(COOKIE_NAME);
    const token = tokenCookie?.value;
    const isValid = token ? await verifyJwtEdge(token, JWT_SECRET) : false;

    // Login page itself
    if (pathname === "/admin-reserved") {
      if (isValid) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL("/admin-reserved/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Other admin pages: must be logged in
    if (!isValid) {
      // Redirect to login
      const response = NextResponse.redirect(new URL("/admin-reserved", request.url));
      // Delete cookie to clean up any invalid token
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-reserved/:path*"],
};
