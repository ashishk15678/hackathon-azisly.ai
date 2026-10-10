import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, baseProcedure } from "../init";
import { db } from "@/lib/db";
import { getLeaderboard } from "@/lib/game-store";

const BASE_SCORE = 1000;

export const gameRouter = createTRPCRouter({
  /**
   * Submit an answer.
   * Works for both authed users (pass userId from session) and guests (pass guestToken).
   * The server records serverReceivedAt — client timestamps are ignored.
   */
  submitAnswer: baseProcedure
    .input(
      z.object({
        roomCode: z.string(),
        questionId: z.string(),
        optionIdx: z.number().int().min(0),
        // One of these must be present
        guestToken: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await db.room.findUnique({
        where: { code: input.roomCode },
        include: { set: { include: { questions: true } } },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.status !== "active")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not active",
        });

      // ── Validate timing (server is the referee) ──────────────────────────
      const now = new Date();
      if (room.qEndsAt && now > room.qEndsAt) {
        // Late answer — silently ignore
        return { accepted: false, reason: "too_late" };
      }

      // ── Resolve player identity ──────────────────────────────────────────
      let playerId: string;
      let isGuest = false;

      if (ctx.user?.id) {
        playerId = ctx.user.id;
      } else if (input.guestToken) {
        const guest = await db.guestPlayer.findUnique({
          where: { token: input.guestToken },
        });
        if (!guest || guest.roomId !== room.id)
          throw new TRPCError({ code: "UNAUTHORIZED" });
        playerId = guest.id;
        isGuest = true;
      } else {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // ── Idempotency: first answer only ───────────────────────────────────
      const existing = await db.answer.findFirst({
        where: isGuest
          ? { roomId: room.id, questionId: input.questionId, guestId: playerId }
          : { roomId: room.id, questionId: input.questionId, userId: playerId },
      });
      if (existing) return { accepted: false, reason: "duplicate" };

      // ── Score calculation ────────────────────────────────────────────────
      const question = room.set.questions.find(
        (q) => q.id === input.questionId,
      );
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const correct = input.optionIdx === question.answerIdx;
      let score = 0;
      if (correct && room.qStartedAt) {
        const elapsedMs = now.getTime() - room.qStartedAt.getTime();
        const fraction = Math.max(
          0,
          1 - elapsedMs / (question.timeSecs * 1000),
        );
        score = Math.round(BASE_SCORE + BASE_SCORE * 0.5 * fraction);
      }

      // ── Persist ──────────────────────────────────────────────────────────
      await db.answer.create({
        data: {
          roomId: room.id,
          questionId: input.questionId,
          optionIdx: input.optionIdx,
          correct,
          score,
          serverReceivedAt: now,
          ...(isGuest ? { guestId: playerId } : { userId: playerId }),
        },
      });

      return { accepted: true, correct, score };
    }),

  /** Live leaderboard snapshot (fallback for SSE-less clients) */
  leaderboard: baseProcedure
    .input(z.object({ roomCode: z.string() }))
    .query(async ({ input }) => {
      return getLeaderboard(input.roomCode);
    }),

  /** Full results for the end screen — fetched once after game_over */
  results: baseProcedure
    .input(z.object({ roomCode: z.string() }))
    .query(async ({ input }) => {
      const room = await db.room.findUnique({
        where: { code: input.roomCode },
        include: {
          answers: {
            include: {
              question: { select: { topic: true, difficulty: true } },
              user: { select: { id: true, name: true } },
              guest: { select: { id: true, name: true } },
            },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });

      // Aggregate per player
      type PlayerStats = {
        id: string;
        name: string;
        score: number;
        correct: number;
        total: number;
        totalMs: number;
        answerCount: number;
        topicStats: Record<string, { correct: number; total: number }>;
      };

      const stats = new Map<string, PlayerStats>();

      for (const ans of room.answers) {
        const id = ans.userId ?? ans.guestId ?? "?";
        const name = ans.user?.name ?? ans.guest?.name ?? "Guest";
        if (!stats.has(id)) {
          stats.set(id, {
            id,
            name,
            score: 0,
            correct: 0,
            total: 0,
            totalMs: 0,
            answerCount: 0,
            topicStats: {},
          });
        }
        const p = stats.get(id)!;
        p.score += ans.score;
        p.total++;
        if (ans.correct) p.correct++;

        const topic = ans.question.topic;
        if (!p.topicStats[topic])
          p.topicStats[topic] = { correct: 0, total: 0 };
        p.topicStats[topic]!.total++;
        if (ans.correct) p.topicStats[topic]!.correct++;
      }

      return [...stats.values()]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({
          ...p,
          rank: i + 1,
          accuracy: p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0,
        }));
    }),
});
