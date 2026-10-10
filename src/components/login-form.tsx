"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setPending] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!email)    errs.email    = "Email is required";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setPending(true);
    try {
      // authClient.signIn.email hits /api/auth/sign-in/email and
      // sets the session cookie in the browser response — tRPC cannot do this.
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh(); // flush Next.js server-component cache so layout sees new session
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={!!fieldErrors.email}
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          placeholder="you@example.com"
          disabled={isPending}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          aria-invalid={!!fieldErrors.password}
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          placeholder="••••••••"
          disabled={isPending}
        />
        {fieldErrors.password && (
          <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
