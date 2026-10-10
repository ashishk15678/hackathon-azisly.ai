/**
 * AptiQuiz player seeder
 * ───────────────────────
 * Creates N guest players in a room and seeds realistic answer data directly
 * in the database. Use this to populate a finished room for testing the
 * host analytics UI.
 *
 * Usage (after `npm run dev` or with a connected DB):
 *   npx tsx scripts/seed-players.ts \
 *     --code  ABCDEF   \   room code (room must exist + be in 'waiting' state)
 *     --players 50     \   number of guest players  (default: 50)
 *     --correctRate 0.6 \  fraction of correct answers per player  (default: 0.6)
 *     --finish true       mark room as 'finished' when done  (default: true)
 *
 * The script:
 *  1. Looks up the room and its questions
 *  2. Creates guest player records
 *  3. Seeds an Answer row per player per question with realistic timing
 *  4. Optionally marks the room as finished
 *  5. Prints a summary table
 */

import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// ── DB ────────────────────────────────────────────────────────────────────────

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaPg({ connectionString: url });
const db      = new PrismaClient({ adapter });

// ── Args ──────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    code:        { type: "string" },
    players:     { type: "string", default: "50" },
    correctRate: { type: "string", default: "0.6" },
    finish:      { type: "string", default: "true" },
  },
});

const ROOM_CODE    = values.code;
const NUM_PLAYERS  = parseInt(values.players!, 10);
const CORRECT_RATE = parseFloat(values.correctRate!);
const MARK_FINISH  = values.finish !== "false";

if (!ROOM_CODE) {
  console.error("❌  --code is required");
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomName() {
  const first = ["Aadi","Priya","Karan","Sneha","Rohan","Meera","Arjun","Zara","Dev","Ananya",
    "Vikram","Deepa","Nikhil","Pooja","Rahul","Shreya","Amit","Kavya","Raj","Nandini",
    "Suresh","Divya","Tushar","Bhavna","Harsh","Simran","Varun","Riya","Sanket","Isha",
    "Ajay","Tanvi","Shiv","Pallavi","Gaurav","Sonal","Manish","Preeti","Vishal","Swati",
    "Akash","Ruhi","Nitin","Ankita","Mayur","Neha","Sumit","Yogita","Piyush","Tanya"];
  const last  = ["S","K","M","P","R","G","T","V","C","A","B","N","J","D","L","H"];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}.`;
}

function scoreForTime(timeSecs: number, elapsedMs: number): number {
  const BASE = 1000;
  const fraction = Math.max(0, 1 - elapsedMs / (timeSecs * 1000));
  return Math.round(BASE + BASE * 0.5 * fraction);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱  AptiQuiz Player Seeder`);
  console.log(`   Room    : ${ROOM_CODE}`);
  console.log(`   Players : ${NUM_PLAYERS}`);
  console.log(`   Correct%: ${Math.round(CORRECT_RATE * 100)}%\n`);

  // Load room
  const room = await db.room.findUnique({
    where:   { code: ROOM_CODE },
    include: {
      set: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });

  if (!room) { console.error(`❌  Room "${ROOM_CODE}" not found`); process.exit(1); }
  const questions = room.set.questions;
  if (questions.length === 0) { console.error("❌  Room has no questions"); process.exit(1); }

  console.log(`   Found ${questions.length} questions in "${room.set.title}"`);

  const startedAt = new Date();
  let totalCorrect = 0, totalWrong = 0, totalScore = 0;

  // Seed players
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const name  = randomName();
    const token = crypto.randomUUID();

    const guest = await db.guestPlayer.create({
      data: { roomId: room.id, name, token },
    });

    let playerScore = 0;
    let playerCorrect = 0;

    // Answer each question
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx]!;

      // Simulate server timestamps
      const qStartedAt  = new Date(startedAt.getTime() + qIdx * (q.timeSecs + 5) * 1000);
      const elapsedMs   = 500 + Math.random() * (q.timeSecs * 0.8) * 1000;
      const receivedAt  = new Date(qStartedAt.getTime() + elapsedMs);

      // Decide correct or wrong
      const correct    = Math.random() < CORRECT_RATE;
      const optionIdx  = correct
        ? q.answerIdx
        : (q.answerIdx + 1 + Math.floor(Math.random() * ((q.options as string[]).length - 1))) % (q.options as string[]).length;

      const score = correct ? scoreForTime(q.timeSecs, elapsedMs) : 0;
      playerScore   += score;
      if (correct) playerCorrect++;

      await db.answer.create({
        data: {
          roomId:          room.id,
          questionId:      q.id,
          guestId:         guest.id,
          optionIdx,
          correct,
          score,
          serverReceivedAt: receivedAt,
        },
      });
    }

    // Update guest score
    await db.guestPlayer.update({
      where: { id: guest.id },
      data:  { score: playerScore },
    });

    totalCorrect += playerCorrect;
    totalWrong   += questions.length - playerCorrect;
    totalScore   += playerScore;

    process.stdout.write(`\r   Seeded ${i + 1}/${NUM_PLAYERS} players…`);
  }

  // Mark room finished
  if (MARK_FINISH) {
    await db.room.update({
      where: { id: room.id },
      data:  {
        status:      "finished",
        currentQIdx: questions.length - 1,
      },
    });
    console.log("\n\n   ✅  Room marked as finished");
  }

  const total = totalCorrect + totalWrong;
  const acc   = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

  console.log("\n📊  Summary");
  console.log("─".repeat(40));
  console.log(`   Players seeded : ${NUM_PLAYERS}`);
  console.log(`   Total answers  : ${total}`);
  console.log(`   Correct        : ${totalCorrect} (${acc}%)`);
  console.log(`   Avg score/player: ${Math.round(totalScore / NUM_PLAYERS)}`);
  console.log(`\n   Open: /host/room/${ROOM_CODE}\n`);

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
