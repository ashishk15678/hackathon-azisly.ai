"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useGameEvents } from "@/hooks/use-game-events";
import type { GameEvent, ScoreEntry } from "@/lib/game-store";
import {
  Card,
  Button,
  Badge,
  Avatar,
  CountdownRing,
  Progress,
  Alert,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  Award01Icon,
  CheckmarkCircle01Icon,
  GameController01Icon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
  Time01Icon,
} from "hugeicons-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Question = {
  prompt: string;
  options: string[]; // server-sent (NOT containing the answer index)
  timeSecs: number;
};

type InitialState = {
  status: string;
  qIdx: number;
  qEndsAt: number | null;
  qStartedAt: number | null;
  currentQ: Question | null;
  leaderboard: ScoreEntry[];
  totalQuestions: number;
};

type Props = {
  roomCode: string;
  initialState: InitialState;
  authedUser: { id: string; name: string } | null;
};

// ── Shuffle options but track the mapping so correct index survives ───────────
function shuffleOptions(options: string[], correctIdx: number, seed: string) {
  // Deterministic per-player shuffle using seed (userId or guestId)
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.abs((hash ^ (i * 2654435761)) % (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return {
    shuffled: indices.map((i) => options[i]!),
    // map from shuffled position → original index
    originalIdx: indices,
  };
}

export function GameClient({ roomCode, initialState, authedUser }: Props) {
  const router = useRouter();
  const trpc = useTRPC();

  // ── Player identity ────────────────────────────────────────────────────
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const playerId = authedUser?.id ?? guestId;
  const playerName = authedUser?.name ?? "Guest";

  useEffect(() => {
    const token = sessionStorage.getItem(`guest_token_${roomCode}`);
    const id = sessionStorage.getItem(`guest_id_${roomCode}`);
    if (token) setGuestToken(token);
    if (id) setGuestId(id);
  }, [roomCode]);

  // ── Game state ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<
    "lobby" | "countdown" | "question" | "reveal" | "finished"
  >(
    initialState.status === "active"
      ? "question"
      : initialState.status === "finished"
        ? "finished"
        : "lobby",
  );
  const [currentQ, setCurrentQ] = useState<Question | null>(
    initialState.currentQ,
  );
  const [qIdx, setQIdx] = useState(initialState.qIdx);
  const [totalQ, setTotalQ] = useState(initialState.totalQuestions);
  const [qEndsAt, setQEndsAt] = useState<number | null>(initialState.qEndsAt);
  const [qStartedAt, setQStartedAt] = useState<number | null>(
    initialState.qStartedAt,
  );
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>(
    initialState.leaderboard,
  );
  const [revealIdx, setRevealIdx] = useState<number | null>(null);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null); // original idx
  const [answerResult, setAnswerResult] = useState<{
    correct: boolean;
    score: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shuffled options for this player
  const shuffle =
    currentQ && playerId
      ? shuffleOptions(
          currentQ.options,
          0 /* correctIdx not needed client-side */,
          playerId,
        )
      : null;

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!qEndsAt) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, qEndsAt - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0 && timerRef.current) clearInterval(timerRef.current);
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qEndsAt]);

  // ── Answer submission ──────────────────────────────────────────────────
  const submitAnswer = useMutation(
    trpc.game.submitAnswer.mutationOptions({
      onSuccess: (res) => {
        if (res.accepted && "correct" in res) {
          setAnswerResult({ correct: res.correct, score: res.score });
        }
      },
    }),
  );

  function handleAnswer(shuffledPosition: number) {
    if (chosenIdx !== null || !currentQ || !playerId) return;
    const originalIdx =
      shuffle?.originalIdx[shuffledPosition] ?? shuffledPosition;
    setChosenIdx(originalIdx);

    // We need the questionId — carried in the event, stored in a ref
    const qId = currentQIdRef.current;
    if (!qId) return;

    submitAnswer.mutate({
      roomCode,
      questionId: qId,
      optionIdx: originalIdx,
      ...(authedUser
        ? { userId: authedUser.id }
        : { guestToken: guestToken ?? undefined }),
    });
  }

  // store questionId from SSE event
  const currentQIdRef = useRef<string>("");

  // ── SSE events ─────────────────────────────────────────────────────────
  const handleEvent = useCallback((ev: GameEvent) => {
    switch (ev.type) {
      case "game_started":
        setPhase("countdown");
        setTimeout(() => setPhase("question"), 3000);
        break;

      case "question_start":
        setCurrentQ({
          prompt: ev.prompt,
          options: ev.options,
          timeSecs: ev.timeSecs,
        });
        setQIdx(ev.qIdx);
        setTotalQ(ev.total);
        setQEndsAt(ev.qEndsAt);
        setQStartedAt(ev.qStartedAt);
        setChosenIdx(null);
        setAnswerResult(null);
        setRevealIdx(null);
        setPhase("question");
        break;

      case "question_end":
        setRevealIdx(ev.answerIdx);
        setPhase("reveal");
        break;

      case "leaderboard":
        setLeaderboard(ev.entries);
        break;

      case "game_over":
        setPhase("finished");
        setLeaderboard(ev.entries);
        break;
    }
  }, []);

  useGameEvents(roomCode, handleEvent);

  const timeSecs = currentQ?.timeSecs ?? 30;
  const timeFrac = qEndsAt ? timeLeft / (timeSecs * 1000) : 1;
  const isDanger = timeFrac < 0.25;

  // ── Render phases ──────────────────────────────────────────────────────

  if (phase === "finished") {
    return (
      <div className="page-container flex flex-col items-center py-16 gap-8">
        <div className="text-center">
          <div className="flex justify-center mb-4 text-yellow-500">
            <Award01Icon size={56} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Game over!</h1>
          <p className="text-gray-500">Here&apos;s how everyone did.</p>
        </div>

        <div className="w-full max-w-md space-y-2">
          {leaderboard.map((e) => (
            <Card
              key={e.id}
              highlighted={e.id === playerId}
              className="flex items-center gap-3 py-3"
            >
              <span className="w-8 flex justify-center">
                <RankIcon rank={e.rank} />
              </span>
              <Avatar name={e.name} size="sm" />
              <span className="flex-1 font-medium text-gray-900">{e.name}</span>
              <span className="font-bold text-indigo-600">{e.score} pts</span>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push("/join")} variant="outline">Play again</Button>
          <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
        </div>
      </div>
    );
  }

  if (phase === "lobby" || phase === "countdown") {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          {phase === "countdown" ? (
            <>
              <div className="text-7xl font-extrabold text-indigo-600 animate-bounce">3</div>
              <p className="text-gray-500">Get ready…</p>
            </>
          ) : (
            <>
              <div className="flex justify-center text-indigo-400">
                <Time01Icon size={52} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Waiting for the host to start…
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="live-dot" aria-hidden="true" />
                <span className="text-sm text-gray-500">
                  Connected to room <strong>{roomCode}</strong>
                </span>
              </div>
              {playerName && <Badge variant="indigo">Playing as {playerName}</Badge>}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Question / reveal ─────────────────────────────────────────────────
  return (
    <div className="page-container max-w-2xl space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress
          value={qIdx + 1}
          max={totalQ}
          size="sm"
          label={`${qIdx + 1} / ${totalQ}`}
        />
        <div className="relative shrink-0 flex items-center justify-center">
          <CountdownRing
            value={timeLeft}
            max={timeSecs * 1000}
            size={56}
            danger={isDanger}
          />
          <span
            className={cn(
              "absolute text-xs font-bold tabular-nums",
              isDanger ? "text-red-600" : "text-indigo-600",
            )}
          >
            {Math.ceil(timeLeft / 1000)}
          </span>
        </div>
      </div>

      {/* Question card */}
      <Card className="text-center py-8 px-6">
        <p className="text-xs text-gray-400 mb-3">Question {qIdx + 1}</p>
        <p className="text-xl font-bold text-gray-900 leading-relaxed">
          {currentQ?.prompt}
        </p>
      </Card>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(shuffle?.shuffled ?? currentQ?.options ?? []).map(
          (opt, shuffledPos) => {
            const originalIdx =
              shuffle?.originalIdx[shuffledPos] ?? shuffledPos;
            const isChosen = chosenIdx === originalIdx;
            const isCorrect = revealIdx !== null && originalIdx === revealIdx;
            const isWrong = revealIdx !== null && isChosen && !isCorrect;

            return (
              <button
                key={shuffledPos}
                onClick={() => handleAnswer(shuffledPos)}
                disabled={
                  chosenIdx !== null || phase === "reveal" || timeLeft === 0
                }
                className={cn(
                  "w-full text-left rounded-2xl border-2 px-5 py-4 font-medium text-sm transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  // default
                  !isChosen &&
                    revealIdx === null &&
                    "border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm",
                  // chosen but not yet revealed
                  isChosen &&
                    revealIdx === null &&
                    "border-indigo-500 bg-indigo-50 text-indigo-700",
                  // correct reveal
                  isCorrect &&
                    "border-green-500 bg-green-50 text-green-800 scale-[1.02]",
                  // wrong reveal
                  isWrong && "border-red-400 bg-red-50 text-red-700 opacity-80",
                  // not chosen, not correct — dim after reveal
                  revealIdx !== null && !isCorrect && !isChosen && "opacity-50",
                  // disabled idle
                  chosenIdx !== null &&
                    !isChosen &&
                    revealIdx === null &&
                    "opacity-50",
                )}
                aria-pressed={isChosen}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5",
                      isCorrect
                        ? "border-green-600 bg-green-600 text-white"
                        : isWrong
                          ? "border-red-500 bg-red-500 text-white"
                          : isChosen
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300 text-gray-500",
                    )}
                  >
                    {isCorrect ? (
                      <CheckmarkCircle01Icon size={13} />
                    ) : isWrong ? (
                      "✗"
                    ) : (
                      String.fromCharCode(65 + shuffledPos)
                    )}
                  </span>
                  {opt}
                </span>
              </button>
            );
          },
        )}
      </div>

      {/* Result feedback */}
      {answerResult && (
        <Alert variant={answerResult.correct ? "success" : "error"}>
          {answerResult.correct
            ? `Correct! +${answerResult.score} points`
            : "Wrong answer. Better luck next round!"}
        </Alert>
      )}

      {/* Waiting message after answering */}
      {chosenIdx !== null && phase === "question" && (
        <p className="text-center text-sm text-gray-400 animate-pulse">
          Answer submitted — waiting for others…
        </p>
      )}

      {/* Mini leaderboard during reveal */}
      {phase === "reveal" && leaderboard.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Standings</p>
          {leaderboard.slice(0, 5).map((e) => (
            <div
              key={e.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                e.id === playerId
                  ? "bg-indigo-50 border border-indigo-200"
                  : "bg-gray-50",
              )}
            >
              <span className="w-5 flex justify-center">
                <RankIcon rank={e.rank} />
              </span>
              <Avatar name={e.name} size="sm" />
              <span className="flex-1 font-medium text-gray-800">{e.name}</span>
              <span className="font-bold text-indigo-600">{e.score}</span>
              {e.delta > 0 && (
                <span className="text-green-600 text-xs">+{e.delta}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <MedalFirstPlaceIcon size={18} className="text-yellow-500" />;
  if (rank === 2) return <MedalSecondPlaceIcon size={18} className="text-gray-400" />;
  if (rank === 3) return <MedalThirdPlaceIcon size={18} className="text-amber-600" />;
  return <span className="text-gray-500 font-mono text-xs">#{rank}</span>;
}
