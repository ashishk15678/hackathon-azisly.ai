import "server-only";
import { createCallerFactory, createTRPCContext } from "./init";
import { appRouter } from "./routers/_app";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Creates a cached tRPC caller for the current request.
 * Safe to call many times in a single render — React cache() dedupes it.
 */
export const createCaller = cache(async () => {
  const h = await headers();
  const ctx = await createTRPCContext({ headers: h });
  return createCallerFactory(appRouter)(ctx);
});
