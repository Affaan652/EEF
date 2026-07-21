"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  isAdminRole,
  getAdminRoute,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

const GENERIC_ERROR = "Invalid email or password.";

// Only redirects within this site are ever honoured, and only into the
// secret admin path - this avoids the login form being used as an open
// redirect to an external site.
function safeNextPath(next: string | null): string {
  const base = `/${getAdminRoute()}`;
  if (!next) return base;
  const isInternal = next.startsWith("/") && !next.startsWith("//");
  const isAdminPath = next === base || next.startsWith(`${base}/`);
  return isInternal && isAdminPath ? next : base;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || null;

  if (!email || !password) {
    return { error: GENERIC_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist, the password is
  // wrong, the account is disabled, or the role isn't an admin role - so
  // none of those cases can be distinguished from the outside.
  if (!user || !user.isActive || !isAdminRole(user.role)) {
    return { error: GENERIC_ERROR };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: GENERIC_ERROR };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  redirect(safeNextPath(next));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect(`/${getAdminRoute()}`);
}
