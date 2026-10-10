import Link from "next/link";
import { createCaller } from "@/trpc/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const caller = await createCaller();
  const session = await caller.auth.getSession();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold">
            A
          </span>
          AptiQuiz
        </Link>

        <nav className="flex items-center gap-6">
          {session ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
