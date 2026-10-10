import { notFound } from "next/navigation";
import { createCaller } from "@/trpc/server";
import { QuizEditor } from "./quiz-editor";

export const metadata = { title: "Edit Quiz — AptiQuiz" };

export default async function EditSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <QuizEditor set={null} />;
  }

  const caller = await createCaller();
  try {
    const set = await caller.quiz.getSet({ id });
    return <QuizEditor set={set} />;
  } catch {
    notFound();
  }
}
