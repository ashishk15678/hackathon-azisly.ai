/**
 * In-process game state store.
 *
 * Lives in the Node.js module cache — survives across requests on the same
 * server process, which is all we need for a single-server deployment.
 *
 * For multi-instance horizontal scaling, swap this for a Redis pub/sub
 * adapter (same interface, different backend).
 */

import "server-only";

export type SSEClient = {
  id: string;
  roomCode: string;
  controller: ReadableStreamDefaultController;
};

export type GameEvent =
  | { type: "player_joined"; name: string; count: number }
  | { type: "player_left"; name: string; count: number }
  | { type: "game_started" }
  | {
      type: "question_start";
      qIdx: number;
      prompt: string;
      options: string[]; // already shuffled for this broadcast (same shuffle for all)
      timeSecs: number;
      qStartedAt: number; // server epoch ms
      qEndsAt: number; // server epoch ms
      total: number;
    }
  | {
      type: "question_end";
      qIdx: number;
      answerIdx: number;
      scores: ScoreEntry[];
    }
  | { type: "leaderboard"; entries: ScoreEntry[] }
  | { type: "game_over"; entries: ScoreEntry[] }
  | { type: "ping" };

export type ScoreEntry = {
  id: string; // userId or guestId
  name: string;
  score: number;
  delta: number; // score change this round
  rank: number;
  correct: boolean | null;
  streak: number;
};

// ─── Singleton maps ───────────────────────────────────────────────────────────

const g = global as unknown as {
  _sseClients?: Map<string, SSEClient>;
  _roomScores?: Map<string, Map<string, ScoreEntry>>;
  _questionTimers?: Map<string, ReturnType<typeof setTimeout>>;
};

if (!g._sseClients) g._sseClients = new Map();
if (!g._roomScores) g._roomScores = new Map();
if (!g._questionTimers) g._questionTimers = new Map();

export const sseClients = g._sseClients!;
export const roomScores = g._roomScores!;
export const questionTimers = g._questionTimers!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Broadcast an event to every SSE subscriber in a room */
export function broadcast(roomCode: string, event: GameEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  const dead: string[] = [];

  for (const [id, client] of sseClients) {
    if (client.roomCode !== roomCode) continue;
    try {
      client.controller.enqueue(encoder.encode(data));
    } catch {
      dead.push(id);
    }
  }
  for (const id of dead) sseClients.delete(id);
}

/** Add / update a player's score entry for a room */
export function upsertScore(roomCode: string, entry: ScoreEntry) {
  if (!roomScores.has(roomCode)) roomScores.set(roomCode, new Map());
  roomScores.get(roomCode)!.set(entry.id, entry);
}

/** Get sorted leaderboard for a room */
export function getLeaderboard(roomCode: string): ScoreEntry[] {
  const map = roomScores.get(roomCode);
  if (!map) return [];
  return [...map.values()]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({
      ...e,
      rank: i + 1,
    }));
}

/** Remove all in-memory state for a finished room */
export function cleanupRoom(roomCode: string) {
  roomScores.delete(roomCode);
  const timer = questionTimers.get(roomCode);
  if (timer) {
    clearTimeout(timer);
    questionTimers.delete(roomCode);
  }
  for (const [id, client] of sseClients) {
    if (client.roomCode === roomCode) sseClients.delete(id);
  }
}
