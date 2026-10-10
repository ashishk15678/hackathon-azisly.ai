"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft01Icon,
  Copy01Icon,
  GameController01Icon,
  Rocket01Icon,
  UserMultipleIcon,
} from "hugeicons-react";
import { Alert, Badge, Button, Card } from "@/components/ui";

type Set = {
  id: string;
  title: string;
  description?: string | null;
  questions: { id: string }[];
};

export function LaunchRoomClient({ set }: { set: Set }) {
  const router  = useRouter();
  const trpc    = useTRPC();
  const [code,  setCode]     = useState("");
  const [copied, setCopied]  = useState(false);

  const create = useMutation(
    trpc.room.create.mutationOptions({
      onSuccess: (room) => setCode(room.code),
    }),
  );

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (code) {
    const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${code}`;
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm w-full text-center space-y-6 py-10">
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600">
              <Rocket01Icon size={32} />
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Room created!</h2>
            <p className="text-gray-500 text-sm">
              Share this code — players join at <strong>/join</strong>
            </p>
          </div>

          {/* Code display */}
          <div
            onClick={copyCode}
            className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl py-6 cursor-pointer hover:bg-indigo-100 transition-colors group"
            title="Click to copy"
          >
            <span className="text-5xl font-extrabold tracking-[0.3em] text-indigo-600">
              {code}
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-indigo-400 group-hover:text-indigo-600">
              <Copy01Icon size={13} />
              {copied ? "Copied!" : "Click to copy"}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={() => router.push(`/host/room/${code}`)}>
              <GameController01Icon size={16} />
              Go to lobby
            </Button>
            <Button variant="outline" fullWidth onClick={() => setCode("")}>
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
          <Badge variant="indigo" className="mb-3">Ready to launch</Badge>
          <h1 className="text-2xl font-extrabold text-gray-900">{set.title}</h1>
          {set.description && (
            <p className="mt-1 text-sm text-gray-500">{set.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Questions</span>
            <Badge variant="indigo">{set.questions.length}</Badge>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Max players</span>
            <Badge variant="default">50</Badge>
          </div>
        </div>

        <Alert variant="info">
          <div className="flex items-start gap-2">
            <UserMultipleIcon size={15} className="mt-0.5 shrink-0" />
            <span>
              Players join with or without an account — guests only need the room code.
            </span>
          </div>
        </Alert>

        {create.error && (
          <Alert variant="error">{create.error.message}</Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft01Icon size={16} />
            Back
          </Button>
          <Button fullWidth loading={create.isPending} onClick={() => create.mutate({ setId: set.id })}>
            <Rocket01Icon size={16} />
            Create room
          </Button>
        </div>
      </Card>
    </div>
  );
}
