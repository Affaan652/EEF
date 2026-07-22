-- AlterTable
ALTER TABLE "admission_applications" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "admission_applications" ALTER COLUMN "city" DROP NOT NULL;
ALTER TABLE "admission_applications" ALTER COLUMN "province" DROP NOT NULL;
