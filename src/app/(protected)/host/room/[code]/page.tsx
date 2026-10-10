import { notFound } from "next/navigation";
import { createCaller } from "@/trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HostRoomClient } from "./host-room-client";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return { title: `Room ${code} — AptiQuiz` };
}

export default async function HostRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [session, caller] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    createCaller(),
  ]);

  try {
    const room = await caller.room.getByCode({ code });
    return (
      <HostRoomClient
        room={room}
        hostName={session?.user.name ?? "Host"}
      />
    );
  } catch {
    notFound();
  }
}
