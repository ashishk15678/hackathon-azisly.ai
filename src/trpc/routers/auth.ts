import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { auth } from "@/lib/auth";

export const authRouter = createTRPCRouter({
  /**
   * Returns the current session (null when logged out).
   * Called from Server Components via the tRPC caller — zero network round-trip.
   */
  getSession: baseProcedure.query(({ ctx }) => {
    return ctx.session ?? null;
  }),

  signUp: baseProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });

      if (!result?.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create account. Email may already be in use.",
        });
      }

      return { success: true, user: result.user };
    }),

  signIn: baseProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
      });
      
      if (!result?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      return { success: true, user: result.user };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    // Better Auth handles cookie invalidation via the /api/auth/sign-out
    // endpoint; from a tRPC route we just confirm the intent and let the
    // client call authClient.signOut() which hits that endpoint directly.
    return { success: true };
  }),
});
