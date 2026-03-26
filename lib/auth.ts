import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getAuthConfig() {
  return {
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@callina.local",
    adminPassword: process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
    sessionToken: process.env.AUTH_GUARD_SECRET ?? "callina-admin-session",
  };
}

export function isValidAdminCredentials(email: string, password: string) {
  const auth = getAuthConfig();
  return email === auth.adminEmail && password === auth.adminPassword;
}

export async function getSessionCookieValue() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
}

export function isValidAdminSessionCookie(value?: string) {
  const auth = getAuthConfig();
  return Boolean(value) && value === auth.sessionToken;
}
