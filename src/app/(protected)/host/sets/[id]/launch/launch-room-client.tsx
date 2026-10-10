"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Card, Button, Badge, Alert } from "@/components/ui";

type Set = {
  id: string;
  title: string;
  description?: string | null;
  questions: { id: string }[];
};

export function LaunchRoomClient({ set }: { set: Set }) {
  const router = useRouter();
  const trpc = useTRPC();
  const [launched, setLaunched] = useState(false);
  const [code, setCode] = useState("");

  const create = useMutation(
    trpc.room.create.mutationOptions({
      onSuccess: (room) => {
        setCode(room.code);
        setLaunched(true);
      },
    }),
  );

  if (launched) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm w-full text-center space-y-6 py-10">
          <div className="text-5xl">🚀</div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Room created!
          </h2>
          <p className="text-gray-500 text-sm">
            Share this code with your players. They can join at{" "}
            <strong>aptiquiz.app/join</strong>
          </p>
          <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl py-6">
            <span className="text-5xl font-extrabold tracking-[0.3em] text-indigo-600">
              {code}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={() => router.push(`/host/room/${code}`)}>
              Go to lobby →
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setLaunched(false)}
            >
              Launch another room
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full space-y-6">
        <div>
          <Badge variant="indigo" className="mb-3">
            Ready to launch
          </Badge>
          <h1 className="text-2xl font-extrabold text-gray-900">{set.title}</h1>
          {set.description && (
            <p className="mt-1 text-sm text-gray-500">{set.description}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Questions</span>
          <Badge variant="indigo">{set.questions.length}</Badge>
        </div>

        <Alert variant="info">
          Players can join with or without an account. Guests just need the room
          code.
        </Alert>

        {create.error && <Alert variant="error">{create.error.message}</Alert>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button
            fullWidth
            loading={create.isPending}
            onClick={() => create.mutate({ setId: set.id })}
          >
            Create room & get code
          </Button>
        </div>
      </Card>
    </div>
  );
}
