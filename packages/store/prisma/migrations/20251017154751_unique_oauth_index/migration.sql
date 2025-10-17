/*
  Warnings:

  - A unique constraint covering the columns `[oAuthType,oAuthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_oAuthType_oAuthId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "User_oAuthType_oAuthId_key" ON "User"("oAuthType", "oAuthId");
