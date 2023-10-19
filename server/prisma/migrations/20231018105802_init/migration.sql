-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('LOBBY', 'PLAYING', 'ENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "minWpm" INTEGER NOT NULL,
    "maxWpm" INTEGER NOT NULL,
    "paragraph" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "status" "GameStatus" NOT NULL DEFAULT 'LOBBY',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameHistory" (
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "wpm" INTEGER NOT NULL,
    "acc" DECIMAL(2,1) NOT NULL,
    "timeTaken" INTEGER NOT NULL,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("gameId","playerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
