import { notFound, redirect } from "next/navigation";
import { createCaller } from "@/trpc/server";
import { LaunchRoomClient } from "./launch-room-client";

export const metadata = { title: "Launch Room — AptiQuiz" };

export default async function LaunchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caller = await createCaller();
  try {
    const set = await caller.quiz.getSet({ id });
    // if (set.questions.length === 0) redirect(`/host/sets/${id}`);
    return <LaunchRoomClient set={set} />;
  } catch {
    notFound();
  }
}
