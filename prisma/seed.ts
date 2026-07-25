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

  // ------------------------------------------------------------
  // Academic year, departments, and classes
  //
  // Departments match the programs listed on the public site. Classes
  // are named per department per year - DAE programs (Civil, Electrical,
  // Mechanical) run 3 years; DIT only runs 2 years.
  // ------------------------------------------------------------

  const academicYear = await prisma.academicYear.upsert({
    where: { label: "2026-2027" },
    update: {},
    create: {
      label: "2026-2027",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2027-07-31"),
      isCurrent: true,
    },
  });

  const departments = [
    { name: "DAE Civil Technology", code: "CIV", years: 3 },
    { name: "DAE Electrical Technology", code: "ELE", years: 3 },
    { name: "DAE Mechanical Technology", code: "MEC", years: 3 },
    { name: "Diploma in Information Technology (DIT)", code: "DIT", years: 2 },
  ];

  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: { name: dept.name, code: dept.code, isActive: true },
    });

    for (let year = 1; year <= dept.years; year++) {
      const className = `${dept.name} - Year ${year}`;
      await prisma.class.upsert({
        where: {
          name_section_academicYearId: {
            name: className,
            section: "",
            academicYearId: academicYear.id,
          },
        },
        update: {},
        create: {
          name: className,
          section: "",
          academicYearId: academicYear.id,
          capacity: 40,
        },
      });
    }

    console.log(`Department ready: ${department.name} (${dept.years} year(s))`);
  }

  console.log("Academic year, departments, and classes are seeded.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
