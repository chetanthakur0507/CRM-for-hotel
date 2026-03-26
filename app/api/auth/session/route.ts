import { NextResponse } from "next/server";
import { getSessionCookieValue, isValidAdminSessionCookie } from "@/lib/auth";

export async function GET() {
  const cookie = await getSessionCookieValue();
  const authenticated = isValidAdminSessionCookie(cookie);

  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}
