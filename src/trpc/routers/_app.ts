import { createTRPCRouter } from "../init";
import { authRouter } from "./auth";
import { quizRouter } from "./quiz";
import { roomRouter } from "./room";
import { gameRouter } from "./game";
import { profileRouter } from "./profile";

export const appRouter = createTRPCRouter({
  auth:    authRouter,
  quiz:    quizRouter,
  room:    roomRouter,
  game:    gameRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
