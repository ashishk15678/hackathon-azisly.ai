import { createCaller } from "@/trpc/server";
import { GameClient } from "./game-client";

export const metadata = { title: "Game — AptiQuiz" };

export default async function GamePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const caller = await createCaller();

  const [session, state] = await Promise.all([
    caller.auth.getSession(),
    caller.room.reconnect({ code }),
  ]);

  return (
    <GameClient
      roomCode={code}
      initialState={state}
      authedUser={
        session ? { id: session.user.id, name: session.user.name } : null
      }
    />
  );
}
