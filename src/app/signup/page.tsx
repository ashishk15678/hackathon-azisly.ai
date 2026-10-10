import { redirect } from "next/navigation";
import Link from "next/link";
import { createCaller } from "@/trpc/server";
import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Create account — AptiQuiz",
  description: "Create your free AptiQuiz account",
};

export default async function SignupPage() {
  // Server-side session check — redirect away if already logged in
  const caller = await createCaller();
  const session = await caller.auth.getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white text-xl font-bold shadow-md mb-4">
            A
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Free forever. No credit card needed.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-8">
          <SignupForm />
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
