import Link from "next/link";
import { createCaller } from "@/trpc/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const caller = await createCaller();
  const session = await caller.auth.getSession();

  return (
    <header className="sticky top-0 z-40 bg-[#f0efe9]/90 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-extrabold text-gray-900 hover:text-indigo-600 transition-colors text-lg"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold">
            A
          </span>
          AptiQuiz
        </Link>

        {/* Centre nav links (hidden on mobile) */}
        {!session && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="#" className="hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              Features <span className="text-xs text-gray-400">▾</span>
            </button>
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-4">
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
                className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
              >
                Request a demo
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
