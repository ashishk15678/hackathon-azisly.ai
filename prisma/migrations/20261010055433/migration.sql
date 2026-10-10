-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('waiting', 'active', 'finished');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "collegeId" TEXT;

-- CreateTable
CREATE TABLE "college" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_set" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answerIdx" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "imageUrl" TEXT,
    "timeSecs" INTEGER NOT NULL DEFAULT 30,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'waiting',
    "currentQIdx" INTEGER NOT NULL DEFAULT -1,
    "qStartedAt" TIMESTAMP(3),
    "qEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_player" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "optionIdx" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "serverReceivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT,
    "score" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT 'default',
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "college_name_key" ON "college"("name");

-- CreateIndex
CREATE INDEX "question_set_hostId_idx" ON "question_set"("hostId");

-- CreateIndex
CREATE INDEX "question_setId_idx" ON "question"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "room_code_key" ON "room"("code");

-- CreateIndex
CREATE INDEX "room_code_idx" ON "room"("code");

-- CreateIndex
CREATE UNIQUE INDEX "guest_player_token_key" ON "guest_player"("token");

-- CreateIndex
CREATE INDEX "guest_player_roomId_idx" ON "guest_player"("roomId");

-- CreateIndex
CREATE INDEX "answer_roomId_questionId_idx" ON "answer"("roomId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "answer_roomId_questionId_userId_key" ON "answer"("roomId", "questionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "answer_roomId_questionId_guestId_key" ON "answer"("roomId", "questionId", "guestId");

-- CreateIndex
CREATE INDEX "league_entry_userId_idx" ON "league_entry"("userId");

-- CreateIndex
CREATE INDEX "league_entry_collegeId_idx" ON "league_entry"("collegeId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "college"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_set" ADD CONSTRAINT "question_set_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_setId_fkey" FOREIGN KEY ("setId") REFERENCES "question_set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_setId_fkey" FOREIGN KEY ("setId") REFERENCES "question_set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_player" ADD CONSTRAINT "guest_player_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest_player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entry" ADD CONSTRAINT "league_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entry" ADD CONSTRAINT "league_entry_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "college"("id") ON DELETE SET NULL ON UPDATE CASCADE;
