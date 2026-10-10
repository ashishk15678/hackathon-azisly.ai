"use client";

import { useEffect, useRef } from "react";
import type { GameEvent } from "@/lib/game-store";

/**
 * Opens a single SSE connection to /api/game-events/[code].
 * Calls onEvent for every event received.
 * Automatically reconnects on disconnect (browser EventSource behaviour).
 */
export function useGameEvents(
  roomCode: string | null,
  onEvent: (event: GameEvent) => void,
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!roomCode) return;

    const es = new EventSource(`/api/game-events/${roomCode}`);

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as GameEvent;
        // Ignore heartbeat pings
        if (parsed.type === "ping") return;
        onEventRef.current(parsed);
      } catch {
        // malformed frame — ignore
      }
    };

    es.onerror = () => {
      // EventSource will auto-reconnect after a back-off
    };

    return () => es.close();
  }, [roomCode]);
}
