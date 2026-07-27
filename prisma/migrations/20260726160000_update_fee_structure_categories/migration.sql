-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN "programYear" INTEGER;
ALTER TABLE "fee_structures" ADD COLUMN "boardRegistrationFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "fee_structures" ADD COLUMN "collegeCardFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "fee_structures" ADD COLUMN "migrationFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "fee_structures" ADD COLUMN "studyTourFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "fee_structures" ADD COLUMN "miscellaneousFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "fee_structures" DROP COLUMN "examFee";
ALTER TABLE "fee_structures" DROP COLUMN "libraryFee";
ALTER TABLE "fee_structures" DROP COLUMN "otherFee";
