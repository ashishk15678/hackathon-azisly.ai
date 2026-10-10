import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  // Use auth directly so we get both session + user in one call
  const data = await auth.api.getSession({ headers: await headers() });
  const user = data?.user ?? null;

  return (
    <header className="sticky top-0 z-40 bg-[#f0efe9]/90 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-extrabold text-gray-900 hover:text-indigo-600 transition-colors text-lg"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold">
            A
          </span>
          <span className="hidden sm:inline">AptiQuiz</span>
        </Link>

        {/* Centre nav links — only shown to logged-out visitors */}
        {!user && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/join" className="hover:text-gray-900 transition-colors">
              Join a game
            </Link>
            <Link href="#how-it-works" className="hover:text-gray-900 transition-colors">
              How it works
            </Link>
          </nav>
        )}

        {/* Logged-in nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/host/sets">My Quizzes</NavLink>
            <NavLink href="/join">Join game</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Edit profile"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:block text-sm text-gray-700 font-medium truncate max-w-[110px]">
                  {user.name}
                </span>
              </Link>
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
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {children}
    </Link>
  );
}
