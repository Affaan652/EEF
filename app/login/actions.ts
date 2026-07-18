"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
  isAdminRole,
  getAdminRoute,
} from "@/lib/auth";

// Best-effort in-memory throttle. Serverless instances are short-lived and
// this map is per-instance, so it is a speed bump against casual brute
// forcing, not a substitute for a real rate limiter (e.g. Upstash, a WAF
// rule, or Vercel Firewall) in front of this route for production use.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  const now = Date.now();
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (isThrottled(email)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic message whether the email is unknown or the password is
  // wrong, so a caller cannot use this form to discover which accounts exist.
  const genericError = "Invalid email or password.";

  if (!user || !user.isActive) {
    return { error: genericError };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: genericError };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
      },
    }),
  ]);

  const destination =
    next && next.startsWith("/")
      ? next
      : isAdminRole(user.role)
      ? `/${getAdminRoute()}`
      : "/portal";

  redirect(destination);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
