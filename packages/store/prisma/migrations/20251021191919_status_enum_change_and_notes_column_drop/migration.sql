/*
  Warnings:

  - The values [SUCCESS,FAILURE] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `Video` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED');
ALTER TABLE "Video" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
COMMIT;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "notes";
