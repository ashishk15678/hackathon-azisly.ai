import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });
  return {
    session,
    user: session?.user ?? null,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/** Public — no auth required */
export const baseProcedure = t.procedure;

/** Protected — throws 401 if not signed in */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
