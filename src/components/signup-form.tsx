"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

// A small selection shown at signup — user can change more later on profile page
const QUICK_AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Priya",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Arjun",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sneha",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Rohan",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zara",
];

export function SignupForm() {
  const router = useRouter();

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [avatar,    setAvatar]    = useState("");
  const [isPending, setPending]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name     = "Enter your full name";
    if (!email)                                  errs.email    = "Email is required";
    if (!password || password.length < 8)        errs.password = "Password must be at least 8 characters";
    if (password !== confirm)                    errs.confirm  = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setPending(true);
    try {
      const result = await authClient.signUp.email({
        name:  name.trim(),
        email,
        password,
        image: avatar || undefined,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (result.error) {
        setError(result.error.message ?? "Could not create account. Email may already be in use.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Avatar quick-pick */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Pick an avatar
          <span className="ml-2 text-xs font-normal text-gray-400">optional — change later</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_AVATARS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setAvatar(avatar === url ? "" : url)}
              className={cn(
                "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110",
                avatar === url
                  ? "border-indigo-500 ring-2 ring-indigo-300"
                  : "border-transparent hover:border-indigo-300",
              )}
              aria-label="Select avatar"
              aria-pressed={avatar === url}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAvatar("")}
            className={cn(
              "w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-bold transition-all",
              !avatar
                ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                : "border-gray-300 text-gray-400 hover:border-gray-400",
            )}
            aria-label="Use initials avatar"
          >
            {name ? name.slice(0, 2).toUpperCase() || "AB" : "AB"}
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="su-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="su-name" type="text" autoComplete="name" required
          value={name} onChange={(e) => setName(e.target.value)}
          className={inputCls} placeholder="Ada Lovelace" disabled={isPending}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="su-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address <span className="text-red-500">*</span>
        </label>
        <input
          id="su-email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className={inputCls} placeholder="you@example.com" disabled={isPending}
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="su-pass" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          id="su-pass" type="password" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          className={inputCls} placeholder="Min. 8 characters" disabled={isPending}
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
      </div>

      {/* Confirm */}
      <div>
        <label htmlFor="su-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm password <span className="text-red-500">*</span>
        </label>
        <input
          id="su-confirm" type="password" autoComplete="new-password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className={inputCls} placeholder="••••••••" disabled={isPending}
          aria-invalid={!!fieldErrors.confirm}
        />
        {fieldErrors.confirm && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirm}</p>}
      </div>

      <button
        type="submit" disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-gray-400">
        You can add your college and update your avatar after signing in.
      </p>
    </form>
  );
}
