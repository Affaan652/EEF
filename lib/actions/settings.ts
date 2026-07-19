"use server";

import { prisma } from "@/lib/prisma";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function changeOwnPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 10) {
    return { error: "New password should be at least 10 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { error: "Account not found." };
  }

  const validCurrent = await verifyPassword(currentPassword, user.passwordHash);
  if (!validCurrent) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: "Password updated." };
}
