import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAuthConfig, isValidAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (!isValidAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const auth = getAuthConfig();

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: auth.sessionToken,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
