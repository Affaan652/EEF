// Run with: npm run seed
//
// Creates one SUPER_ADMIN account so you have a way to log in for the
// first time. Reads the email/password from environment variables rather
// than hardcoding them, so no real password ever sits in source control.
// Change the password immediately after your first login.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running the seed script."
    );
  }

  if (password.length < 10) {
    throw new Error(
      "SEED_ADMIN_PASSWORD should be at least 10 characters. Pick something long and unique."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin account ready: ${admin.email} (role: ${admin.role})`);
  console.log("Sign in at /login, then change this password from a real admin-facing settings page once you build one.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
