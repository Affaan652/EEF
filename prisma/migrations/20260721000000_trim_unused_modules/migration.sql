-- ============================================================
-- Trim unused modules
--
-- Removes tables/columns for features that are not built into the
-- product yet: staff/HR, timetables, payroll, marks, scholarships,
-- expenses, announcements, notifications, campus calendar, discipline
-- records, library, hostel, transport, activity logs, banners, and
-- college_info. Also removes the "active" flag from students (a
-- student's record is just their enrollment - it is not toggled
-- on/off), and removes staff/student-portal roles from the Role enum.
--
-- Run this with `npx prisma migrate deploy` (or `migrate dev` while
-- developing). Take a backup of the database first if any of these
-- tables already have data you care about - this is destructive.
-- ============================================================

-- Drop tables that depend on other dropped tables first
DROP TABLE IF EXISTS "_ScholarshipToStudent";
DROP TABLE IF EXISTS "library_issues";
DROP TABLE IF EXISTS "hostel_allocations";
DROP TABLE IF EXISTS "transport_subscriptions";
DROP TABLE IF EXISTS "route_stops";
DROP TABLE IF EXISTS "buses";
DROP TABLE IF EXISTS "hostel_rooms";
DROP TABLE IF EXISTS "transport_routes";
DROP TABLE IF EXISTS "hostel_blocks";
DROP TABLE IF EXISTS "books";
DROP TABLE IF EXISTS "discipline_records";
DROP TABLE IF EXISTS "campus_calendar_events";
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "announcements";
DROP TABLE IF EXISTS "payroll_logs";
DROP TABLE IF EXISTS "expenses";
DROP TABLE IF EXISTS "scholarships";
DROP TABLE IF EXISTS "marks";
DROP TABLE IF EXISTS "timetables";
DROP TABLE IF EXISTS "staff";
DROP TABLE IF EXISTS "activity_logs";
DROP TABLE IF EXISTS "banners";
DROP TABLE IF EXISTS "college_info";

-- Drop columns that referenced the removed tables
ALTER TABLE "student_fees" DROP COLUMN IF EXISTS "scholarshipId";

-- Students no longer have a login account (there is no student portal).
-- Drop the link to "users" and the "active" flag, and store contact
-- email directly on the student record instead.
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_userId_fkey";
DROP INDEX IF EXISTS "students_userId_key";
ALTER TABLE "students" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "students" DROP COLUMN IF EXISTS "isActive";
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Drop enum types that were only used by the removed tables
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "NotificationStatus";
DROP TYPE IF EXISTS "BookStatus";
DROP TYPE IF EXISTS "HostelRoomType";
DROP TYPE IF EXISTS "DisciplineAction";
DROP TYPE IF EXISTS "AnnouncementTarget";
DROP TYPE IF EXISTS "TransportRouteStatus";

-- Shrink the Role enum to admin-only roles (no TEACHER, STUDENT,
-- LIBRARIAN, or HOSTEL_WARDEN accounts exist or are created anywhere
-- in the app). Postgres can't drop enum values directly, so the type
-- is recreated and the column is migrated over.
--
-- IMPORTANT: if you ever created a "users" row with role = 'STUDENT'
-- (e.g. while testing the old "Add student" form), the next statement
-- will fail because that value has no home in the new enum. Check
-- first with: SELECT id, email, role FROM "users" WHERE role NOT IN
-- ('SUPER_ADMIN','ADMIN','PRINCIPAL','ACCOUNTANT'); and delete or
-- reassign those rows before running this migration.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACCOUNTANT');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
