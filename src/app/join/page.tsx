import { createCaller } from "@/trpc/server";
import { JoinClient } from "./join-client";

export const metadata = { title: "Join a Game — AptiQuiz" };

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const caller = await createCaller();
  const session = await caller.auth.getSession();

  return (
    <JoinClient
      prefillCode={code ?? ""}
      authedUser={
        session ? { id: session.user.id, name: session.user.name } : null
      }
    />
  );
}
