import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";

export const profileRouter = createTRPCRouter({
  /** Get the current user's profile (includes college name) */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.user.id },
      include: { college: { select: { id: true, name: true } } },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  /** Update display name, avatar URL, and/or college */
  update: protectedProcedure
    .input(
      z.object({
        name:       z.string().min(2).max(60).optional(),
        image:      z.string().url().nullable().optional(),  // avatar URL
        collegeId:  z.string().optional(),
        newCollege: z.string().min(2).max(100).optional(),   // create new college on the fly
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let resolvedCollegeId: string | undefined = input.collegeId;

      // Create college if a new name was provided and no existing id was given
      if (input.newCollege && !input.collegeId) {
        const existing = await db.college.findFirst({
          where: { name: { equals: input.newCollege, mode: "insensitive" } },
        });
        if (existing) {
          resolvedCollegeId = existing.id;
        } else {
          const created = await db.college.create({ data: { name: input.newCollege } });
          resolvedCollegeId = created.id;
        }
      }

      return db.user.update({
        where: { id: ctx.user.id },
        data: {
          ...(input.name  !== undefined && { name:  input.name }),
          ...(input.image !== undefined && { image: input.image }),
          ...(resolvedCollegeId !== undefined && { collegeId: resolvedCollegeId }),
        },
        include: { college: { select: { id: true, name: true } } },
      });
    }),

  /** List all colleges (for the autocomplete dropdown) */
  colleges: protectedProcedure.query(async () => {
    return db.college.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  }),
});
