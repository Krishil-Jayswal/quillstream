-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Info', 'Error');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
