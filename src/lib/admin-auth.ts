import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "./auth";

export function getAdminUser(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie) return null;
  return verifyToken(cookie.value);
}
