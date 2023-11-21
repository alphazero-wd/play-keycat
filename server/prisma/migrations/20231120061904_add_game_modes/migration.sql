-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('RANKED', 'CASUAL', 'PRACTICE');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "mode" "GameMode" NOT NULL DEFAULT 'RANKED';
