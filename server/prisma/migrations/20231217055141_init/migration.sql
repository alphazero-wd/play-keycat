-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('RANKED', 'CASUAL', 'PRACTICE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inGameId" UUID,
    "currentLevel" INT4 NOT NULL DEFAULT 1,
    "xpsGained" INT4 NOT NULL DEFAULT 0,
    "catPoints" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "minPoints" INT4 NOT NULL,
    "maxPoints" INT4 NOT NULL,
    "paragraph" STRING NOT NULL,
    "startedAt" TIMESTAMP(3),
    "mode" "GameMode" NOT NULL DEFAULT 'RANKED',
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameHistory" (
    "gameId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "wpm" INT4 NOT NULL,
    "acc" DECIMAL(4,1) NOT NULL,
    "catPoints" INT4 NOT NULL,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("gameId","playerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_inGameId_fkey" FOREIGN KEY ("inGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
