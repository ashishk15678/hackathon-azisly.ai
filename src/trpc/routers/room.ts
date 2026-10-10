import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import {
  broadcast,
  getLeaderboard,
  questionTimers,
  roomScores,
  upsertScore,
} from "@/lib/game-store";
import * as XLSX from "xlsx";

// ── Scoring ───────────────────────────────────────────────────────────────────
const BASE_SCORE = 1000;

function calcScore(timeSecs: number, elapsedMs: number): number {
  const fraction = Math.max(0, 1 - elapsedMs / (timeSecs * 1000));
  return Math.round(BASE_SCORE + BASE_SCORE * 0.5 * fraction);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Advance to the next question or finish the game */
async function advanceQuestion(roomId: string, roomCode: string) {
  const room = await db.room.findUniqueOrThrow({
    where: { id: roomId },
    include: { set: { include: { questions: { orderBy: { order: "asc" } } } } },
  });

  const questions = room.set.questions;
  const nextIdx = room.currentQIdx + 1;

  if (nextIdx >= questions.length) {
    // Game over
    await db.room.update({
      where: { id: roomId },
      data: { status: "finished" },
    });
    const board = getLeaderboard(roomCode);

    // Persist league entries for logged-in players
    const entries = board
      .filter((e) => !e.id.startsWith("guest_"))
      .map((e) =>
        db.leagueEntry.create({
          data: { userId: e.id, score: e.score, roomId, season: "default" },
        }),
      );
    await db.$transaction(entries);

    broadcast(roomCode, { type: "game_over", entries: board });
    return;
  }

  const q = questions[nextIdx]!;
  const now = Date.now();
  const qEndsAt = now + q.timeSecs * 1000;

  await db.room.update({
    where: { id: roomId },
    data: {
      currentQIdx: nextIdx,
      qStartedAt: new Date(now),
      qEndsAt: new Date(qEndsAt),
    },
  });

  broadcast(roomCode, {
    type: "question_start",
    qIdx: nextIdx,
    prompt: q.prompt,
    options: q.options as string[], // shuffled per player client-side from a seed
    timeSecs: q.timeSecs,
    qStartedAt: now,
    qEndsAt,
    total: questions.length,
  });

  // Server timer — closes question after timeSecs regardless of client state
  const timer = setTimeout(
    async () => {
      questionTimers.delete(roomCode);
      await closeQuestion(
        roomId,
        roomCode,
        q.id,
        q.answerIdx,
        questions.length,
      );
    },
    q.timeSecs * 1000 + 200,
  ); // +200 ms grace for in-flight answers

  questionTimers.set(roomCode, timer);
}

/** Reveal answer, tally scores, broadcast */
async function closeQuestion(
  roomId: string,
  roomCode: string,
  questionId: string,
  answerIdx: number,
  totalQuestions: number,
) {
  const answers = await db.answer.findMany({
    where: { roomId, questionId },
    include: {
      user: { select: { id: true, name: true } },
      guest: { select: { id: true, name: true } },
    },
  });

  // Update in-memory scores
  for (const ans of answers) {
    const playerId = ans.userId ?? ans.guestId!;
    const playerName = ans.user?.name ?? ans.guest?.name ?? "Player";
    const prev = roomScores.get(roomCode)?.get(playerId);
    const prevScore = prev?.score ?? 0;
    const prevStreak = prev?.streak ?? 0;

    const delta = ans.score;
    const newScore = prevScore + delta;
    upsertScore(roomCode, {
      id: playerId,
      name: playerName,
      score: newScore,
      delta,
      rank: 0, // will be set by getLeaderboard
      correct: ans.correct,
      streak: ans.correct ? prevStreak + 1 : 0,
    });
  }

  const board = getLeaderboard(roomCode);

  broadcast(roomCode, {
    type: "question_end",
    qIdx: -1,
    answerIdx,
    scores: board,
  });
  broadcast(roomCode, { type: "leaderboard", entries: board });

  // Wait 4 s then advance
  setTimeout(() => advanceQuestion(roomId, roomCode), 4000);
}

// ── Router ────────────────────────────────────────────────────────────────────

export const roomRouter = createTRPCRouter({
  /** Create a room from a question set */
  create: protectedProcedure
    .input(z.object({ setId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const set = await db.questionSet.findFirst({
        where: { id: input.setId, hostId: ctx.user.id },
      });
      if (!set) throw new TRPCError({ code: "NOT_FOUND" });

      // Generate a unique 6-char uppercase code
      let code = "";
      while (true) {
        code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const existing = await db.room.findUnique({ where: { code } });
        if (!existing) break;
      }

      const room = await db.room.create({
        data: { code, setId: input.setId, hostId: ctx.user.id },
      });
      return room;
    }),

  /** Get full room state (host view) */
  getByCode: baseProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const room = await db.room.findUnique({
        where: { code: input.code },
        include: {
          host: { select: { name: true } },
          guests: { select: { id: true, name: true, score: true } },
          set: {
            select: { title: true, _count: { select: { questions: true } } },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      return room;
    }),

  /** List rooms created by the current host */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return db.room.findMany({
      where: { hostId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        set: { select: { title: true } },
        _count: { select: { guests: true, answers: true } },
      },
      take: 20,
    });
  }),

  /** Join as a guest (no account needed) */
  joinGuest: baseProcedure
    .input(z.object({ code: z.string(), name: z.string().min(1).max(40) }))
    .mutation(async ({ input }) => {
      const room = await db.room.findUnique({ where: { code: input.code } });
      if (!room)
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      if (room.status === "finished")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This game has ended",
        });

      const token = crypto.randomUUID();
      const guest = await db.guestPlayer.create({
        data: { roomId: room.id, name: input.name, token },
      });

      // Pre-seed score entry
      upsertScore(input.code, {
        id: guest.id,
        name: guest.name,
        score: 0,
        delta: 0,
        rank: 0,
        correct: null,
        streak: 0,
      });

      broadcast(input.code, {
        type: "player_joined",
        name: guest.name,
        count: roomScores.get(input.code)?.size ?? 0,
      });

      return { guestId: guest.id, token, roomCode: input.code };
    }),

  /** Join as an authenticated user */
  joinAuthed: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await db.room.findUnique({ where: { code: input.code } });
      if (!room)
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      if (room.status === "finished")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This game has ended",
        });

      upsertScore(input.code, {
        id: ctx.user.id,
        name: ctx.user.name,
        score: 0,
        delta: 0,
        rank: 0,
        correct: null,
        streak: 0,
      });

      broadcast(input.code, {
        type: "player_joined",
        name: ctx.user.name,
        count: roomScores.get(input.code)?.size ?? 0,
      });

      return { roomCode: input.code };
    }),

  /** Host starts the game */
  start: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await db.room.findUnique({ where: { code: input.code } });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.hostId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (room.status !== "waiting")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game already started",
        });

      await db.room.update({
        where: { id: room.id },
        data: { status: "active" },
      });
      broadcast(input.code, { type: "game_started" });

      // Kick off first question after a short countdown
      setTimeout(() => advanceQuestion(room.id, input.code), 3000);
      return { started: true };
    }),

  /** Host skips current question — reveals answer immediately */
  skipQuestion: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await db.room.findUnique({
        where: { code: input.code },
        include: { set: { include: { questions: { orderBy: { order: "asc" } } } } },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.hostId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (room.status !== "active")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Room is not active" });

      // Cancel the running timer
      const timer = questionTimers.get(input.code);
      if (timer) { clearTimeout(timer); questionTimers.delete(input.code); }

      const q = room.set.questions[room.currentQIdx];
      if (!q) throw new TRPCError({ code: "BAD_REQUEST", message: "No current question" });

      await closeQuestion(room.id, input.code, q.id, q.answerIdx, room.set.questions.length);
      return { skipped: true };
    }),

  /** Host kicks a guest player */
  kickPlayer: protectedProcedure
    .input(z.object({ code: z.string(), guestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await db.room.findUnique({ where: { code: input.code } });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.hostId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      await db.guestPlayer.delete({ where: { id: input.guestId } });
      // Remove from in-memory scores
      roomScores.get(input.code)?.delete(input.guestId);
      broadcast(input.code, {
        type: "player_left",
        name: input.guestId,
        count: roomScores.get(input.code)?.size ?? 0,
      });
      return { kicked: true };
    }),

  /** Rich results for the host analytics view */
  getFullResults: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await db.room.findUnique({
        where: { code: input.code },
        include: {
          set: {
            include: {
              questions: { orderBy: { order: "asc" } },
            },
          },
          answers: {
            include: {
              user:     { select: { id: true, name: true, email: true, image: true } },
              guest:    { select: { id: true, name: true } },
              question: { select: { id: true, prompt: true, topic: true, difficulty: true, answerIdx: true, options: true } },
            },
            orderBy: { serverReceivedAt: "asc" },
          },
          guests: { select: { id: true, name: true, score: true } },
        },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.hostId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      // ── Per-player stats ──────────────────────────────────────────────────
      const playerMap = new Map<string, {
        id: string; name: string; email: string; image: string | null;
        score: number; correct: number; total: number;
        topicStats: Record<string, { correct: number; total: number }>;
        answers: { questionId: string; correct: boolean; score: number; optionIdx: number }[];
      }>();

      for (const ans of room.answers) {
        const id   = ans.userId ?? ans.guestId ?? "?";
        const name = ans.user?.name ?? ans.guest?.name ?? "Guest";
        const email = ans.user?.email ?? "—";
        const image = ans.user?.image ?? null;
        if (!playerMap.has(id)) {
          playerMap.set(id, { id, name, email, image, score: 0, correct: 0, total: 0, topicStats: {}, answers: [] });
        }
        const p = playerMap.get(id)!;
        p.score += ans.score;
        p.total++;
        if (ans.correct) p.correct++;
        if (!p.topicStats[ans.question.topic]) p.topicStats[ans.question.topic] = { correct: 0, total: 0 };
        p.topicStats[ans.question.topic]!.total++;
        if (ans.correct) p.topicStats[ans.question.topic]!.correct++;
        p.answers.push({ questionId: ans.question.id, correct: ans.correct, score: ans.score, optionIdx: ans.optionIdx });
      }

      const players = [...playerMap.values()]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({
          ...p,
          rank:     i + 1,
          accuracy: p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0,
        }));

      // ── Per-question stats ────────────────────────────────────────────────
      const qMap = new Map<string, { id: string; prompt: string; topic: string; difficulty: string; totalAnswers: number; correctAnswers: number; optionCounts: number[] }>();
      for (const ans of room.answers) {
        const q = ans.question;
        if (!qMap.has(q.id)) {
          qMap.set(q.id, { id: q.id, prompt: q.prompt, topic: q.topic, difficulty: q.difficulty, totalAnswers: 0, correctAnswers: 0, optionCounts: Array((q.options as string[]).length).fill(0) });
        }
        const qs = qMap.get(q.id)!;
        qs.totalAnswers++;
        if (ans.correct) qs.correctAnswers++;
        if (qs.optionCounts[ans.optionIdx] !== undefined) qs.optionCounts[ans.optionIdx]!++;
      }

      const questions = room.set.questions.map((q) => {
        const stats = qMap.get(q.id);
        return {
          id:          q.id,
          prompt:      q.prompt,
          topic:       q.topic,
          difficulty:  q.difficulty,
          answerIdx:   q.answerIdx,
          options:     q.options as string[],
          totalAnswers: stats?.totalAnswers ?? 0,
          correctAnswers: stats?.correctAnswers ?? 0,
          accuracy:    stats?.totalAnswers ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0,
          optionCounts: stats?.optionCounts ?? [],
        };
      });

      return {
        code: room.code,
        title: room.set.title,
        status: room.status,
        createdAt: room.createdAt,
        totalPlayers: players.length + room.guests.length,
        players,
        questions,
      };
    }),

  /** Reconnect — return current room state for a returning player */
  reconnect: baseProcedure
    .input(z.object({ code: z.string(), guestToken: z.string().optional() }))
    .query(async ({ input }) => {
      const room = await db.room.findUnique({
        where: { code: input.code },
        include: {
          set: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  prompt: true,
                  options: true,
                  timeSecs: true,
                  order: true,
                },
              },
            },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });

      const leaderboard = getLeaderboard(input.code);
      const qIdx = room.currentQIdx;
      const currentQ = qIdx >= 0 ? room.set.questions[qIdx] : null;

      return {
        status: room.status,
        qIdx,
        qEndsAt: room.qEndsAt?.getTime() ?? null,
        qStartedAt: room.qStartedAt?.getTime() ?? null,
        currentQ: currentQ
          ? {
              prompt: currentQ.prompt,
              options: currentQ.options as string[],
              timeSecs: currentQ.timeSecs,
            }
          : null,
        leaderboard,
        totalQuestions: room.set.questions.length,
      };
    }),

  /** Export room results as an XLSX buffer (base64) */
  exportResults: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await db.room.findUnique({
        where: { code: input.code },
        include: {
          set: { include: { questions: { orderBy: { order: "asc" } } } },
          answers: {
            include: {
              user: { select: { name: true, email: true } },
              guest: { select: { name: true } },
              question: {
                select: { prompt: true, topic: true, difficulty: true },
              },
            },
            orderBy: { serverReceivedAt: "asc" },
          },
          guests: true,
        },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.hostId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      // Build per-player summary
      type PlayerRow = {
        Name: string;
        Email: string;
        Score: number;
        Correct: number;
        Wrong: number;
        "Accuracy %": number;
        "Avg Speed (ms)": number;
      };
      const playerMap = new Map<string, PlayerRow>();

      for (const ans of room.answers) {
        const key = ans.userId ?? ans.guestId ?? "unknown";
        const name = ans.user?.name ?? ans.guest?.name ?? "Guest";
        const email = ans.user?.email ?? "—";
        if (!playerMap.has(key)) {
          playerMap.set(key, {
            Name: name,
            Email: email,
            Score: 0,
            Correct: 0,
            Wrong: 0,
            "Accuracy %": 0,
            "Avg Speed (ms)": 0,
          });
        }
        const row = playerMap.get(key)!;
        row.Score += ans.score;
        if (ans.correct) row.Correct++;
        else row.Wrong++;
      }

      for (const row of playerMap.values()) {
        const total = row.Correct + row.Wrong;
        row["Accuracy %"] =
          total > 0 ? Math.round((row.Correct / total) * 100) : 0;
      }

      // Answer detail sheet
      const detail = room.answers.map((a) => ({
        Player: a.user?.name ?? a.guest?.name ?? "Guest",
        Question: a.question.prompt.slice(0, 80),
        Topic: a.question.topic,
        Difficulty: a.question.difficulty,
        Correct: a.correct ? "Yes" : "No",
        Score: a.score,
        "Received At": a.serverReceivedAt.toISOString(),
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet([...playerMap.values()]),
        "Summary",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(detail),
        "Detail",
      );

      const buf = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      return {
        base64: buf as string,
        filename: `room-${input.code}-results.xlsx`,
      };
    }),
});
