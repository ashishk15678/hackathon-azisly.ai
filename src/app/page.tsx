import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <span className="inline-block rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 mb-6 tracking-wide uppercase">
          Live multiplayer quiz
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
          Aptitude practice that
          <br className="hidden sm:block" /> actually feels like a game
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Join a room, race the clock, watch the leaderboard move. AptiQuiz
          turns campus placement prep into a live multiplayer battle.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
