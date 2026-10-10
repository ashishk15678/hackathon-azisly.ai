import { redirect } from "next/navigation";
import { createCaller } from "@/trpc/server";

export const metadata = { title: "Dashboard — AptiQuiz" };

export default async function DashboardPage() {
  const caller = await createCaller();
  const session = await caller.auth.getSession();

  // Belt-and-suspenders: middleware handles this, but guard here too
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name} 👋
        </h1>
        <p className="text-gray-500 mb-8">
          Ready to play? Jump into a game or create a quiz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Join a game</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter a room code to jump into a live quiz.
            </p>
            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
              Enter room code
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Host a game</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create a question set and invite players.
            </p>
            <button className="w-full rounded-lg border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-50 transition-colors">
              Create quiz
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
