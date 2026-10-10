"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function SignupForm() {
  const router = useRouter();
  const trpc = useTRPC();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { mutate, isPending, error } = useMutation(
    trpc.auth.signUp.mutationOptions({
      onSuccess: () => router.push("/dashboard"),
    }),
  );

  function validate() {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length < 2) errs.name = "Enter your full name";
    if (!email) errs.email = "Email is required";
    if (!password || password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (password !== confirm) errs.confirm = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutate({ name: name.trim(), email, password });
  }

  const serverError = error?.message ?? null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {(
        [
          {
            id: "name",
            label: "Full name",
            type: "text",
            autoComplete: "name",
            value: name,
            setter: setName,
            placeholder: "Ada Lovelace",
          },
          {
            id: "email",
            label: "Email address",
            type: "email",
            autoComplete: "email",
            value: email,
            setter: setEmail,
            placeholder: "you@example.com",
          },
          {
            id: "password",
            label: "Password",
            type: "password",
            autoComplete: "new-password",
            value: password,
            setter: setPassword,
            placeholder: "Min. 8 characters",
          },
          {
            id: "confirm",
            label: "Confirm password",
            type: "password",
            autoComplete: "new-password",
            value: confirm,
            setter: setConfirm,
            placeholder: "••••••••",
          },
        ] as const
      ).map(({ id, label, type, autoComplete, value, setter, placeholder }) => (
        <div key={id}>
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            autoComplete={autoComplete}
            required
            value={value}
            onChange={(e) => setter(e.target.value)}
            aria-describedby={fieldErrors[id] ? `${id}-error` : undefined}
            aria-invalid={!!fieldErrors[id]}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            placeholder={placeholder}
            disabled={isPending}
          />
          {fieldErrors[id] && (
            <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
              {fieldErrors[id]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
