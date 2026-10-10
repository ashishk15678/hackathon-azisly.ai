import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";

const questionInput = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  answerIdx: z.number().int().min(0),
  topic: z.enum(["quantitative", "logical", "verbal", "data_interpretation"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  imageUrl: z.string().url().optional().nullable(),
  timeSecs: z.number().int().min(10).max(120).default(30),
  order: z.number().int().default(0),
});

export const quizRouter = createTRPCRouter({
  // ── Question Sets ──────────────────────────────────────────────────────────

  listSets: protectedProcedure.query(async ({ ctx }) => {
    return db.questionSet.findMany({
      where: { hostId: ctx.user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { questions: true, rooms: true } } },
    });
  }),

  getSet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const set = await db.questionSet.findFirst({
        where: { id: input.id, hostId: ctx.user.id },
        include: { questions: { orderBy: { order: "asc" } } },
      });
      if (!set) throw new TRPCError({ code: "NOT_FOUND" });
      return set;
    }),

  createSet: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.questionSet.create({
        data: { ...input, hostId: ctx.user.id },
      });
    }),

  updateSet: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(120).optional(),
        description: z.string().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertSetOwner(id, ctx.user.id);
      return db.questionSet.update({ where: { id }, data });
    }),

  deleteSet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertSetOwner(input.id, ctx.user.id);
      await db.questionSet.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ── Questions ──────────────────────────────────────────────────────────────

  addQuestion: protectedProcedure
    .input(z.object({ setId: z.string() }).merge(questionInput))
    .mutation(async ({ ctx, input }) => {
      await assertSetOwner(input.setId, ctx.user.id);
      const { setId, ...data } = input;
      // Place at end
      const count = await db.question.count({ where: { setId } });
      return db.question.create({ data: { ...data, setId, order: count } });
    }),

  updateQuestion: protectedProcedure
    .input(z.object({ id: z.string() }).merge(questionInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await assertQuestionOwner(id, ctx.user.id);
      return db.question.update({ where: { id }, data });
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertQuestionOwner(input.id, ctx.user.id);
      await db.question.delete({ where: { id: input.id } });
      return { success: true };
    }),

  reorderQuestions: protectedProcedure
    .input(
      z.object({
        setId: z.string(),
        // ordered list of question IDs in new order
        ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertSetOwner(input.setId, ctx.user.id);
      await db.$transaction(
        input.ids.map((id, order) =>
          db.question.update({ where: { id }, data: { order } }),
        ),
      );
      return { success: true };
    }),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertSetOwner(setId: string, userId: string) {
  const set = await db.questionSet.findFirst({ where: { id: setId } });
  if (!set) throw new TRPCError({ code: "NOT_FOUND" });
  if (set.hostId !== userId) throw new TRPCError({ code: "FORBIDDEN" });
  return set;
}

async function assertQuestionOwner(questionId: string, userId: string) {
  const q = await db.question.findFirst({
    where: { id: questionId },
    include: { set: { select: { hostId: true } } },
  });
  if (!q) throw new TRPCError({ code: "NOT_FOUND" });
  if (q.set.hostId !== userId) throw new TRPCError({ code: "FORBIDDEN" });
  return q;
}
