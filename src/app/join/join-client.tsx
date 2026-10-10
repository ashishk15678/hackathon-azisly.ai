"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight01Icon,
  GameController01Icon,
  UserCircleIcon,
} from "hugeicons-react";
import { Alert, Badge, Button, Card, Field, Input } from "@/components/ui";

type Props = {
  prefillCode: string;
  authedUser: { id: string; name: string } | null;
};

export function JoinClient({ prefillCode, authedUser }: Props) {
  const router = useRouter();
  const trpc   = useTRPC();

  const [code,   setCode]   = useState(prefillCode.toUpperCase());
  const [name,   setName]   = useState(authedUser?.name ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const joinGuest = useMutation(
    trpc.room.joinGuest.mutationOptions({
      onSuccess: (data) => {
        sessionStorage.setItem(`guest_token_${data.roomCode}`, data.token);
        sessionStorage.setItem(`guest_id_${data.roomCode}`,    data.guestId);
        router.push(`/game/${data.roomCode}`);
      },
    }),
  );

  const joinAuthed = useMutation(
    trpc.room.joinAuthed.mutationOptions({
      onSuccess: (data) => router.push(`/game/${data.roomCode}`),
    }),
  );

  function validate() {
    const errs: Record<string, string> = {};
    if (!code.trim() || code.trim().length !== 6)
      errs.code = "Enter a valid 6-character room code";
    if (!authedUser && !name.trim())
      errs.name = "Enter your display name";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (authedUser) {
      joinAuthed.mutate({ code: code.trim().toUpperCase() });
    } else {
      joinGuest.mutate({ code: code.trim().toUpperCase(), name: name.trim() });
    }
  }

  const isPending   = joinGuest.isPending || joinAuthed.isPending;
  const serverError = joinGuest.error?.message ?? joinAuthed.error?.message;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
            <GameController01Icon size={32} />
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            Join a game
          </h1>
          <p className="text-gray-500 text-sm">
            Enter the room code your host shared with you.
          </p>
        </div>

        <Card>
          <form onSubmit={handleJoin} noValidate className="space-y-5">
            {serverError && <Alert variant="error">{serverError}</Alert>}

            <Field label="Room code" id="code" required error={errors.code}>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                className="text-center text-2xl font-bold tracking-[0.3em] uppercase"
                maxLength={6}
                error={!!errors.code}
                autoFocus
                autoComplete="off"
              />
            </Field>

            {authedUser ? (
              <div className="flex items-center gap-3 bg-indigo-50 rounded-xl px-4 py-3">
                <UserCircleIcon size={20} className="text-indigo-500 shrink-0" />
                <div>
                  <p className="text-xs text-indigo-500">Joining as</p>
                  <p className="font-semibold text-indigo-800">{authedUser.name}</p>
                </div>
                <Badge variant="indigo" className="ml-auto">Signed in</Badge>
              </div>
            ) : (
              <Field label="Your display name" id="name" required error={errors.name}>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya S."
                  error={!!errors.name}
                  autoComplete="nickname"
                />
              </Field>
            )}

            <Button type="submit" fullWidth size="lg" loading={isPending}>
              Join game
              <ArrowRight01Icon size={16} />
            </Button>
          </form>
        </Card>

        {!authedUser && (
          <p className="text-center text-xs text-gray-400 mt-5">
            Playing as a guest — scores won&apos;t count toward the league.{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Create a free account
            </a>{" "}
            to track progress.
          </p>
        )}
      </div>
    </main>
  );
}
