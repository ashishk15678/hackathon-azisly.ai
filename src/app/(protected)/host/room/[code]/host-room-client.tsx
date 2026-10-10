"use client";

import { useState, useCallback, useRef } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGameEvents } from "@/hooks/use-game-events";
import type { GameEvent, ScoreEntry } from "@/lib/game-store";
import {
  BarChartIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Delete01Icon,
  Download01Icon,
  Medal01Icon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
  PlayCircleIcon,
  StopCircleIcon,
  Time01Icon,
  UserMultipleIcon,
} from "hugeicons-react";
import {
  Alert, Avatar, Badge, Button, Card,
  Progress, Table, Tbody, Td, Th, Thead, Tr,
} from "@/components/ui";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

type Room = {
  code: string;
  status: string;
  set: { title: string; _count: { questions: number } };
  guests: { id: string; name: string; score: number }[];
  host: { name: string };
};

type Tab = "lobby" | "live" | "results" | "analytics";

// ── Component ─────────────────────────────────────────────────────────────────

export function HostRoomClient({ room: initial, hostName }: { room: Room; hostName: string }) {
  const trpc = useTRPC();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab,         setTab]        = useState<Tab>("lobby");
  const [status,      setStatus]     = useState(initial.status);
  const [players,     setPlayers]    = useState(initial.guests);
  const [leaderboard, setLeader]     = useState<ScoreEntry[]>([]);
  const [currentQ,    setCurrentQ]   = useState<{ prompt: string; qIdx: number; total: number; timeSecs: number } | null>(null);
  const [lastRound,   setLastRound]  = useState<{ answerIdx: number; scores: ScoreEntry[] } | null>(null);
  const [timeLeft,    setTimeLeft]   = useState<number>(0);
  const [qEndsAt,     setQEndsAt]    = useState<number | null>(null);
  const [copied,      setCopied]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const startRoom    = useMutation(trpc.room.start.mutationOptions({
    onSuccess: () => { setStatus("active"); setTab("live"); },
  }));
  const skipQuestion = useMutation(trpc.room.skipQuestion.mutationOptions());
  const kickPlayer   = useMutation(trpc.room.kickPlayer.mutationOptions({
    onSuccess: (_, vars) => setPlayers((p) => p.filter((pl) => pl.id !== vars.guestId)),
  }));

  // ── Results query (enabled once finished) ─────────────────────────────────
  const resultsQuery = useQuery(
    trpc.room.getFullResults.queryOptions(
      { code: initial.code },
      { enabled: status === "finished" },
    ),
  );

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportQuery = useQuery(trpc.room.exportResults.queryOptions({ code: initial.code }, { enabled: false }));

  async function handleExport() {
    setDownloading(true);
    try {
      const r = await exportQuery.refetch();
      if (!r.data) return;
      const { base64, filename } = r.data;
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setDownloading(false);
    }
  }

  // ── Countdown ──────────────────────────────────────────────────────────────
  function startCountdown(endsAt: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      setTimeLeft(left);
      if (left === 0 && timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, 200);
  }

  // ── SSE ────────────────────────────────────────────────────────────────────
  const handleEvent = useCallback((ev: GameEvent) => {
    switch (ev.type) {
      case "player_joined":
        setPlayers((p) => [...p, { id: crypto.randomUUID(), name: ev.name, score: 0 }]);
        break;
      case "player_left":
        // handled via kickPlayer mutation
        break;
      case "game_started":
        setStatus("active");
        setTab("live");
        break;
      case "question_start":
        setCurrentQ({ prompt: ev.prompt, qIdx: ev.qIdx, total: ev.total, timeSecs: ev.timeSecs });
        setQEndsAt(ev.qEndsAt);
        setLastRound(null);
        startCountdown(ev.qEndsAt);
        break;
      case "question_end":
        setLastRound({ answerIdx: ev.answerIdx, scores: ev.scores });
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setTimeLeft(0);
        break;
      case "leaderboard":
        setLeader(ev.entries);
        break;
      case "game_over":
        setStatus("finished");
        setLeader(ev.entries);
        setTab("results");
        break;
    }
  }, []);

  useGameEvents(initial.code, handleEvent);

  // ── Copy code ──────────────────────────────────────────────────────────────
  async function copyCode() {
    await navigator.clipboard.writeText(initial.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const isWaiting  = status === "waiting";
  const isActive   = status === "active";
  const isFinished = status === "finished";
  const timeFrac   = qEndsAt && currentQ ? timeLeft / (currentQ.timeSecs * 1000) : 0;
  const isDanger   = timeFrac < 0.25 && timeFrac > 0;

  const TABS: { id: Tab; label: string }[] = [
    { id: "lobby",     label: "Lobby" },
    { id: "live",      label: "Live" },
    { id: "results",   label: "Results" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="page-container space-y-6">
      {/* ── Top header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Hosting</p>
          <h1 className="text-2xl font-extrabold text-gray-900">{initial.set.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusPill status={status} />
            <span className="text-xs text-gray-400">{initial.set._count.questions} questions</span>
          </div>
        </div>

        {/* Room code card */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyCode}
            className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl px-6 py-3 text-center group hover:bg-indigo-100 transition-colors"
          >
            <p className="text-xs text-indigo-400 font-medium mb-0.5">Room code</p>
            <p className="text-3xl font-extrabold tracking-[0.25em] text-indigo-700 font-mono">
              {initial.code}
            </p>
            <p className="text-xs text-indigo-400 mt-1 flex items-center justify-center gap-1">
              <Copy01Icon size={11} />
              {copied ? "Copied!" : "Click to copy"}
            </p>
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {label}
              {id === "lobby" && <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{players.length}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Lobby tab ───────────────────────────────────────────────────── */}
      {tab === "lobby" && (
        <LobbyTab
          code={initial.code}
          players={players}
          isWaiting={isWaiting}
          isActive={isActive}
          isFinished={isFinished}
          startPending={startRoom.isPending}
          onStart={() => startRoom.mutate({ code: initial.code })}
          onKick={(guestId) => kickPlayer.mutate({ code: initial.code, guestId })}
        />
      )}

      {/* ── Live tab ────────────────────────────────────────────────────── */}
      {tab === "live" && (
        <LiveTab
          code={initial.code}
          isActive={isActive}
          isFinished={isFinished}
          currentQ={currentQ}
          timeLeft={timeLeft}
          timeFrac={timeFrac}
          isDanger={isDanger}
          lastRound={lastRound}
          leaderboard={leaderboard}
          skipPending={skipQuestion.isPending}
          onSkip={() => skipQuestion.mutate({ code: initial.code })}
        />
      )}

      {/* ── Results tab ─────────────────────────────────────────────────── */}
      {tab === "results" && (
        <ResultsTab
          leaderboard={leaderboard}
          isFinished={isFinished}
          downloading={downloading}
          onExport={handleExport}
          fullResults={resultsQuery.data ?? null}
        />
      )}

      {/* ── Analytics tab ───────────────────────────────────────────────── */}
      {tab === "analytics" && (
        <AnalyticsTab
          fullResults={resultsQuery.data ?? null}
          isFinished={isFinished}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY TAB
// ─────────────────────────────────────────────────────────────────────────────

function LobbyTab({
  code, players, isWaiting, isActive, isFinished,
  startPending, onStart, onKick,
}: {
  code: string;
  players: { id: string; name: string; score: number }[];
  isWaiting: boolean; isActive: boolean; isFinished: boolean;
  startPending: boolean;
  onStart: () => void;
  onKick: (id: string) => void;
}) {
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join?code=${code}`
    : `/join?code=${code}`;

  return (
    <div className="space-y-5">
      {isWaiting && (
        <Alert variant="info">
          Share the code <strong className="font-mono">{code}</strong> or the link below. Players can join from any device — no account needed.
        </Alert>
      )}

      {/* Join link */}
      <Card className="flex items-center justify-between gap-4 py-3">
        <p className="text-xs text-gray-500 font-mono truncate">{joinUrl}</p>
        <Button
          size="sm" variant="outline"
          onClick={() => { navigator.clipboard.writeText(joinUrl); }}
        >
          <Copy01Icon size={13} /> Copy link
        </Button>
      </Card>

      {/* Player list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <UserMultipleIcon size={17} className="text-indigo-500" />
            Players
            <Badge variant="indigo">{players.length}</Badge>
          </h2>
          {isWaiting && (
            <Button
              onClick={onStart}
              loading={startPending}
              disabled={players.length === 0}
            >
              <PlayCircleIcon size={15} />
              Start game
            </Button>
          )}
        </div>

        {players.length === 0 ? (
          <Card className="text-center py-10 text-gray-400">
            Waiting for players to join…
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {players.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 py-2.5 px-4">
                <Avatar name={p.name} size="sm" />
                <span className="font-medium text-gray-900 flex-1 text-sm">{p.name}</span>
                {(isActive || isFinished) && (
                  <span className="text-xs font-bold text-indigo-600">{p.score} pts</span>
                )}
                {isWaiting && (
                  <button
                    onClick={() => onKick(p.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Kick player"
                  >
                    <Cancel01Icon size={14} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TAB
// ─────────────────────────────────────────────────────────────────────────────

function LiveTab({
  code, isActive, isFinished, currentQ, timeLeft, timeFrac, isDanger,
  lastRound, leaderboard, skipPending, onSkip,
}: {
  code: string;
  isActive: boolean; isFinished: boolean;
  currentQ: { prompt: string; qIdx: number; total: number; timeSecs: number } | null;
  timeLeft: number; timeFrac: number; isDanger: boolean;
  lastRound: { answerIdx: number; scores: ScoreEntry[] } | null;
  leaderboard: ScoreEntry[];
  skipPending: boolean;
  onSkip: () => void;
}) {
  if (!isActive && !isFinished) {
    return (
      <Card className="text-center py-16 text-gray-400">
        Game hasn&apos;t started yet — go to the Lobby tab to start.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current question banner */}
      {isActive && currentQ && (
        <div className="bg-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-indigo-300 text-xs font-medium mb-1">
                Question {currentQ.qIdx + 1} of {currentQ.total}
              </p>
              <p className="text-lg font-bold leading-snug">{currentQ.prompt}</p>
            </div>
            {/* Countdown */}
            <div className="shrink-0 text-center">
              <div className={cn(
                "text-4xl font-extrabold tabular-nums",
                isDanger ? "text-red-300" : "text-white",
              )}>
                {Math.ceil(timeLeft / 1000)}
              </div>
              <div className="text-indigo-300 text-xs mt-0.5">seconds</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={timeFrac * 100} size="sm" variant={isDanger ? "red" : "indigo"} className="opacity-60" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-indigo-200 text-sm">Live</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={skipPending}
              onClick={onSkip}
              className="text-indigo-200 hover:text-white hover:bg-indigo-700"
            >
              <StopCircleIcon size={14} />
              Skip question
            </Button>
          </div>
        </div>
      )}

      {isFinished && (
        <Alert variant="success" title="Game finished!">
          Switch to the Results tab to see the full breakdown.
        </Alert>
      )}

      {/* Last round result */}
      {lastRound && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Round results</h3>
          <div className="flex flex-wrap gap-2">
            {lastRound.scores.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm border",
                  s.correct
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200",
                )}
              >
                <Avatar name={s.name} size="sm" />
                <span className="font-medium">{s.name}</span>
                {s.correct ? (
                  <span className="text-green-600 font-bold text-xs">+{s.delta}</span>
                ) : (
                  <span className="text-gray-400 text-xs">✕</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Live leaderboard */}
      {leaderboard.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Medal01Icon size={15} className="text-indigo-500" />
            Live leaderboard
          </h3>
          <div className="space-y-1.5">
            {leaderboard.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5"
              >
                <span className="w-6 flex justify-center shrink-0">
                  <RankIcon rank={e.rank} />
                </span>
                <Avatar name={e.name} size="sm" />
                <span className="font-medium text-gray-900 flex-1 text-sm">{e.name}</span>
                <span className="font-bold text-indigo-600 text-sm">{e.score}</span>
                {e.delta > 0 && (
                  <span className="text-green-600 text-xs font-semibold">+{e.delta}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS TAB
// ─────────────────────────────────────────────────────────────────────────────

type FullResults = {
  code: string; title: string; status: string;
  totalPlayers: number;
  players: {
    id: string; name: string; email: string; image: string | null;
    rank: number; score: number; correct: number; total: number; accuracy: number;
    topicStats: Record<string, { correct: number; total: number }>;
  }[];
  questions: {
    id: string; prompt: string; topic: string; difficulty: string;
    answerIdx: number; options: string[];
    totalAnswers: number; correctAnswers: number; accuracy: number;
    optionCounts: number[];
  }[];
};

function ResultsTab({
  leaderboard, isFinished, downloading, onExport, fullResults,
}: {
  leaderboard: ScoreEntry[];
  isFinished: boolean;
  downloading: boolean;
  onExport: () => void;
  fullResults: FullResults | null;
}) {
  if (!isFinished) {
    return (
      <Card className="text-center py-16 text-gray-400">
        Results will appear here when the game ends.
      </Card>
    );
  }

  const players = fullResults?.players ?? leaderboard.map((e, i) => ({
    id: e.id, name: e.name, email: "—", image: null,
    rank: i + 1, score: e.score, correct: 0, total: 0, accuracy: 0, topicStats: {},
  }));

  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[players[1], players[0], players[2]].map((p, podiumPos) => {
            if (!p) return null;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = ["bg-gray-100", "bg-indigo-50 border-2 border-indigo-200", "bg-amber-50"];
            return (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <Avatar name={p.name} src={p.image} size="md" />
                <p className="text-xs font-semibold text-gray-700 text-center truncate w-full">{p.name}</p>
                <p className="text-sm font-bold text-indigo-600">{p.score} pts</p>
                <div className={cn(
                  "w-full rounded-t-xl flex items-end justify-center pb-2",
                  heights[podiumPos], colors[podiumPos],
                )}>
                  <RankIcon rank={podiumPos === 0 ? 2 : podiumPos === 1 ? 1 : 3} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export button */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          Player results
          <Badge variant="indigo">{players.length}</Badge>
        </h2>
        <Button variant="outline" loading={downloading} onClick={onExport}>
          <Download01Icon size={15} />
          Download Excel
        </Button>
      </div>

      {/* Full results table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Player</Th>
            <Th>Score</Th>
            <Th>Correct</Th>
            <Th>Accuracy</Th>
            <Th>Topics</Th>
          </Tr>
        </Thead>
        <Tbody>
          {players.map((p) => (
            <Tr key={p.id}>
              <Td><RankIcon rank={p.rank} /></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar name={p.name} src={p.image} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    {p.email !== "—" && <p className="text-xs text-gray-400">{p.email}</p>}
                  </div>
                </div>
              </Td>
              <Td className="font-bold text-indigo-600">{p.score}</Td>
              <Td>
                <span className="text-green-600 font-medium">{p.correct}</span>
                <span className="text-gray-400">/{p.total}</span>
              </Td>
              <Td>
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Progress value={p.accuracy} size="sm" variant={p.accuracy >= 70 ? "green" : p.accuracy >= 40 ? "yellow" : "red"} />
                  <span className="text-xs text-gray-500 shrink-0">{p.accuracy}%</span>
                </div>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(p.topicStats).map(([topic, stat]) => (
                    <span
                      key={topic}
                      className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-medium"
                      title={`${topic}: ${stat.correct}/${stat.total}`}
                    >
                      {topicShort(topic)}{" "}
                      <span className={stat.correct / stat.total >= 0.6 ? "text-green-600" : "text-red-500"}>
                        {Math.round((stat.correct / stat.total) * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsTab({
  fullResults, isFinished,
}: {
  fullResults: FullResults | null;
  isFinished: boolean;
}) {
  if (!isFinished || !fullResults) {
    return (
      <Card className="text-center py-16 text-gray-400">
        Analytics will appear here when the game ends.
      </Card>
    );
  }

  const { questions } = fullResults;

  // Sort by accuracy ascending — most-failed first
  const sorted = [...questions].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total players",    value: fullResults.totalPlayers },
          { label: "Questions",        value: questions.length },
          { label: "Avg accuracy",     value: `${Math.round(questions.reduce((s, q) => s + q.accuracy, 0) / (questions.length || 1))}%` },
          { label: "Hardest question", value: sorted[0] ? `Q${questions.findIndex((q) => q.id === sorted[0]!.id) + 1}` : "—" },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center py-4">
            <div className="text-2xl font-extrabold text-indigo-600">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      {/* Per-question breakdown */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChartIcon size={17} className="text-indigo-500" />
          Question analysis
          <span className="text-xs font-normal text-gray-400">worst to best</span>
        </h2>
        <div className="space-y-3">
          {sorted.map((q, i) => {
            const qNum = questions.findIndex((qq) => qq.id === q.id) + 1;
            return (
              <Card key={q.id} className={cn("space-y-3", q.accuracy < 40 && "border-red-200")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      q.accuracy < 40 ? "bg-red-100 text-red-700"
                      : q.accuracy < 70 ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700",
                    )}>Q{qNum}</span>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{q.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DiffBadge diff={q.difficulty} />
                    <Badge variant="default">{topicShort(q.topic)}</Badge>
                  </div>
                </div>

                {/* Accuracy bar */}
                <div className="flex items-center gap-3">
                  <Progress
                    value={q.accuracy}
                    size="sm"
                    variant={q.accuracy < 40 ? "red" : q.accuracy < 70 ? "yellow" : "green"}
                  />
                  <span className="text-xs font-semibold text-gray-500 shrink-0 w-10">
                    {q.accuracy}%
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {q.correctAnswers}/{q.totalAnswers} correct
                  </span>
                </div>

                {/* Option distribution */}
                {q.optionCounts.length > 0 && q.totalAnswers > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {q.options.map((opt, idx) => {
                      const count = q.optionCounts[idx] ?? 0;
                      const pct   = Math.round((count / q.totalAnswers) * 100);
                      const isCorrect = idx === q.answerIdx;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "rounded-lg px-3 py-2 text-xs border",
                            isCorrect
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-gray-50 border-gray-200 text-gray-600",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium truncate mr-1">{opt.slice(0, 20)}{opt.length > 20 ? "…" : ""}</span>
                            {isCorrect && <CheckmarkCircle01Icon size={12} className="text-green-600 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", isCorrect ? "bg-green-500" : "bg-gray-400")}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-gray-500">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  if (status === "active")   return <Badge variant="green"  dot>Live</Badge>;
  if (status === "finished") return <Badge variant="default">Finished</Badge>;
  return <Badge variant="yellow" dot>Waiting</Badge>;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <MedalFirstPlaceIcon  size={20} className="text-yellow-500" />;
  if (rank === 2) return <MedalSecondPlaceIcon size={20} className="text-gray-400" />;
  if (rank === 3) return <MedalThirdPlaceIcon  size={20} className="text-amber-600" />;
  return <span className="text-gray-500 font-mono text-xs">#{rank}</span>;
}

function DiffBadge({ diff }: { diff: string }) {
  if (diff === "easy") return <Badge variant="green">Easy</Badge>;
  if (diff === "hard") return <Badge variant="red">Hard</Badge>;
  return <Badge variant="yellow">Medium</Badge>;
}

function topicShort(t: string) {
  return { quantitative: "Quant", logical: "Logic", verbal: "Verbal", data_interpretation: "DI" }[t] ?? t;
}
