import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroWidget } from "@/components/hero-widget";

/* ─────────────────────────────────────────────
   ANNOUNCEMENT BANNER
───────────────────────────────────────────── */
function AnnouncementBanner() {
  return (
    <div className="bg-indigo-600 text-white text-sm font-medium flex items-center justify-center gap-3 px-4 py-2.5 relative z-50">
      <span className="hidden sm:inline">⚡</span>
      <span>AptiQuiz launches College Leagues — compete across campuses</span>
      <Link
        href="/signup"
        className="underline underline-offset-2 hover:no-underline font-semibold whitespace-nowrap"
      >
        Join free →
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGO MARQUEE
───────────────────────────────────────────── */
const colleges = [
  "IIT Bombay",
  "NIT Trichy",
  "BITS Pilani",
  "VIT Vellore",
  "IIT Delhi",
  "IIIT Hyderabad",
  "Amrita",
  "Manipal",
  "IIT Bombay",
  "NIT Trichy",
  "BITS Pilani",
  "VIT Vellore",
  "IIT Delhi",
  "IIIT Hyderabad",
  "Amrita",
  "Manipal",
];

function LogoMarquee() {
  return (
    <div className="border-t border-gray-200 bg-[#f0efe9] py-10 overflow-hidden">
      <p className="text-xs text-gray-400 tracking-wide text-center mb-6">
        Students preparing for campus drives at
      </p>
      <div className="relative flex overflow-hidden">
        <div className="marquee-track flex gap-16 items-center whitespace-nowrap">
          {colleges.map((c, i) => (
            <span
              key={i}
              className="text-sm font-bold text-gray-400 tracking-widest uppercase"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROBLEM SECTION (dark)
───────────────────────────────────────────── */
function ProblemSection() {
  return (
    <section className="bg-[#1a1a1a] text-white py-28 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <div className="reveal-left">
            <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight">
              Prep didn&apos;t get
              <br />
              harder.
              <br />
              <span className="text-gray-400">It got boring.</span>
            </h2>
          </div>
          <div className="reveal-right delay-200 space-y-5 text-gray-400 leading-relaxed">
            <p>
              Students are grinding through PDFs and static mock tests alone,
              with no time pressure, no competition, and no feedback beyond a
              score at the end. Meanwhile, placement tests eliminate thousands
              of capable students on speed alone — not ability.
            </p>
            <p>
              AptiQuiz puts 50 students in the same room, at the same moment,
              racing through the same questions. The AI watches every session,
              finds where marks are dropping, and builds targeted drills.
              Performance compounds instead of resetting every PDF.
            </p>
          </div>
        </div>

        {/* "Messy journey" diagram */}
        <div className="reveal">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-400 mb-6">
              Your prep is a{" "}
              <span className="text-orange-400 font-semibold">mess</span>
            </p>
            <MessDiagram />
          </div>
        </div>

        {/* Clean journey */}
        <div className="mt-6 reveal delay-200">
          <div className="rounded-2xl bg-indigo-600 p-6">
            <p className="text-sm text-white/70 mb-6">
              Clean it up with{" "}
              <span className="text-white font-semibold">AptiQuiz</span>
            </p>
            <CleanDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

function MessDiagram() {
  const rows = [
    ["👤", "📄", "✕", "📄", "✕", "📄", "✕"],
    ["👤", "📄", "✕", "📄", "📄", "✕", "📄"],
    ["👤", "✕", "📄", "✕", "📄", "✕", "📄"],
  ];
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          {row.map((cell, j) => (
            <span
              key={j}
              className={`text-lg ${cell === "✕" ? "text-red-400" : cell === "👤" ? "text-gray-400" : "text-gray-600"}`}
            >
              {cell}
            </span>
          ))}
          {row[row.length - 1] !== "✓" && (
            <span className="text-red-400 ml-auto text-xs font-mono">
              ELIMINATED
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function CleanDiagram() {
  const rows = [
    ["👤", "📱", "•", "✉", "•", "💬", "•", "✓"],
    ["👤", "•", "📱", "•", "✉", "•", "•", "✓"],
    ["👤", "💻", "•", "•", "💬", "•", "✉", "✓"],
  ];
  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-4">
          {row.map((cell, j) => (
            <span
              key={j}
              className={`${
                cell === "✓"
                  ? "w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                  : cell === "•"
                    ? "text-white/30 text-xs"
                    : "text-lg"
              }`}
            >
              {cell === "✓" ? "✓" : cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT STACK SECTION
───────────────────────────────────────────── */
function ProductStack() {
  return (
    <section className="bg-[#f0efe9] py-28 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="reveal-left">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              The aptitude stack,
              <br />
              modernised
            </h2>

            {/* Stacked layer cards */}
            <div className="relative mt-12 h-48">
              <div className="absolute bottom-0 left-0 right-12 h-24 bg-indigo-600 rounded-2xl flex items-end px-5 pb-3">
                <span className="text-white/60 text-xs font-mono tracking-widest">
                  AI ENGINE
                </span>
              </div>
              <div className="absolute bottom-8 left-4 right-8 h-24 bg-gray-800 rounded-2xl flex items-end px-5 pb-3 shadow-xl">
                <span className="text-white/60 text-xs font-mono tracking-widest">
                  LIVE ROOMS
                </span>
              </div>
              <div className="absolute bottom-16 left-8 right-4 h-24 bg-[#e8e7e0] border border-gray-300 rounded-2xl flex items-end px-5 pb-3 shadow-xl">
                <span className="text-gray-500 text-xs font-mono tracking-widest">
                  QUESTION BANK
                </span>
              </div>
            </div>
          </div>

          <div className="reveal-right delay-200 space-y-8 pt-4">
            <p className="text-gray-500 leading-relaxed text-base">
              AptiQuiz replaces isolated PDF practice, manual exam creation, and
              guesswork feedback with one live platform — connecting students,
              faculty, and recruiters through real competitive data.
            </p>

            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
              ONE PLATFORM, THREE LAYERS
              <br />— BUILT FOR THE APTITUDE ATHLETE
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "Live Room Engine",
                  color: "bg-indigo-600",
                  desc: "Host creates a room from any question set, shares a 6-character code, and up to 50 students join across devices. The server is the referee — no client clock is ever trusted.",
                },
                {
                  title: "AI Decisioning",
                  color: "bg-gray-800",
                  desc: "After every session, the AI detects weak sub-topics per student, generates targeted drills, and serves adaptive difficulty so every room gets harder as the class improves.",
                },
                {
                  title: "Question Bank & Authoring",
                  color: "bg-indigo-300",
                  desc: "Faculty create rich question sets — text, images, tables — tag by topic and difficulty, then reuse across league seasons. Built-in analytics show which questions catch everyone out.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className={`w-1 rounded-full ${item.color} shrink-0`} />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid sm:grid-cols-2 gap-6">
          <div className="reveal bg-gray-900 text-white rounded-3xl p-8">
            <h3 className="text-3xl font-extrabold mb-2">Live Rooms</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              The space where students race together, see each other on the
              leaderboard, and feel real placement pressure.
            </p>
            <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-4">
              USAGE-BASED SCORING
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-xl border border-white text-white px-5 py-2 text-sm font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Start for free
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "50-player rooms",
                "Instant join code",
                "Reconnect mid-game",
                "Anti-cheat built-in",
                "Team battles",
                "Spectator mode",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-xs text-gray-400"
                >
                  <span className="text-indigo-400">⚡</span> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="reveal delay-200 bg-indigo-600 text-white rounded-3xl p-8">
            <h3 className="text-3xl font-extrabold mb-2">College Leagues</h3>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Rooms belong to a college. Scores roll up into a live league table
              showing top players and top colleges, week by week.
            </p>
            <p className="text-[10px] font-semibold text-indigo-300 tracking-widest uppercase mb-4">
              SEASON-BASED COMPETITION
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-xl border border-white text-white px-5 py-2 text-sm font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Register college
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Cross-campus rankings",
                "Season history",
                "Faculty analytics",
                "Export results",
                "Daily challenge streaks",
                "Topic leagues",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-xs text-indigo-200"
                >
                  <span className="text-green-300">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES / 10x SECTION
───────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="bg-[#f0efe9] py-28 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="reveal mb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold text-gray-900 leading-tight">
            Become a<br />
            10× quiz player
          </h2>
        </div>
        <div className="reveal delay-200 mb-20">
          <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
            AI agents learn your weak spots, accelerate your prep with live
            battles, and personalise every drill — with rules you can see and
            trust.
          </p>
        </div>

        {/* Feature 1: AI agent chat */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="reveal-left">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span>⚡</span> Spot weak topics
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              AI agents continuously audit your sessions, separating what&apos;s
              working from what isn&apos;t, and surface exactly where marks are
              leaking before your next drive.
            </p>
            <div className="mt-1 w-px h-16 bg-indigo-300 ml-1" />
          </div>

          {/* Chat UI mockup */}
          <div className="reveal-right delay-200">
            <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                  A
                </div>
                <span className="text-white text-xs font-semibold">
                  AptiQuiz Agent
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="bg-gray-700 text-white text-xs rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                    How did I do in data interpretation last week?
                  </div>
                </div>
                <div className="text-gray-300 text-xs leading-relaxed">
                  Your DI accuracy dropped to 54% — the chart-based questions
                  are the gap. Here&apos;s the breakdown and a 5-question drill
                  ready to go.
                </div>
                <div className="bg-gray-800 rounded-2xl p-4 space-y-2">
                  <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-3">
                    TOPIC PERFORMANCE
                  </p>
                  {[
                    { t: "Number Series", v: 88, c: "bg-indigo-500" },
                    { t: "Data Interpretation", v: 54, c: "bg-orange-500" },
                    { t: "Logical Puzzles", v: 71, c: "bg-indigo-400" },
                    { t: "Verbal Analogies", v: 46, c: "bg-red-500" },
                  ].map((row) => (
                    <div key={row.t}>
                      <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                        <span>{row.t}</span>
                        <span>{row.v}%</span>
                      </div>
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.c} rounded-full`}
                          style={{ width: `${row.v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 border border-orange-500/40 rounded-xl p-2.5">
                    <p className="text-[9px] text-orange-400 leading-relaxed">
                      ⚡ Focus on chart-reading DI questions — accuracy drops
                      18% vs. table-based. 5-question drill queued.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Personalised decisions */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 reveal-left delay-100">
            {/* Player cards mockup */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
              <div className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full w-fit mb-6">
                <span>⚡</span> Personalised difficulty
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    name: "Priya S.",
                    tag: "QUANT STRONG",
                    badge: "PUSH — HARD",
                    status: "CONVERTED",
                    statusColor: "text-green-600",
                  },
                  {
                    name: "Arjun K.",
                    tag: "DI WEAK",
                    badge: "EMAIL — MEDIUM",
                    status: "PENDING",
                    statusColor: "text-yellow-600",
                  },
                  {
                    name: "Sneha R.",
                    tag: "VERBAL ACE",
                    badge: "SMS — EASY",
                    status: "CONVERTED",
                    statusColor: "text-green-600",
                  },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[9px] space-y-1"
                  >
                    <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                    <p className="text-gray-400 font-mono">{p.tag}</p>
                    <div className="mt-2 bg-gray-900 text-white rounded-lg px-2 py-1.5">
                      <p className="font-semibold text-[9px]">{p.badge}</p>
                    </div>
                    <p className={`text-[9px] font-semibold ${p.statusColor}`}>
                      ✓ {p.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 reveal-right">
            <div className="mt-1 w-px h-16 bg-indigo-300 ml-1 mb-6" />
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span>⚡</span> Personalised decision
            </div>
            <p className="text-gray-600 leading-relaxed">
              AptiQuiz ranks, scores, and predicts the right difficulty, topic,
              and timing for each student in real time. One host brief generates
              a unique experience for every player in the room.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS TICKER SECTION (dark)
───────────────────────────────────────────── */
const leftTicker = [
  "QUIZ ROOM CREATED",
  "PLAYER JOINED",
  "CORRECT ANSWER — QUANT",
  "WEAK TOPIC FLAGGED",
  "LEADERBOARD UPDATED",
  "STREAK MAINTAINED — DAY 7",
  "TEAM BATTLE STARTED",
  "COLLEGE LEAGUE POINT SCORED",
  "RECONNECTION HANDLED",
  "DAILY CHALLENGE COMPLETED",
  "QUIZ ROOM CREATED",
  "PLAYER JOINED",
  "CORRECT ANSWER — QUANT",
  "WEAK TOPIC FLAGGED",
  "LEADERBOARD UPDATED",
  "STREAK MAINTAINED — DAY 7",
  "TEAM BATTLE STARTED",
  "COLLEGE LEAGUE POINT SCORED",
  "RECONNECTION HANDLED",
  "DAILY CHALLENGE COMPLETED",
];

const rightTicker = [
  "⚡ SPEED BONUS EARNED",
  "⚡ DOUBLE POINTS POWER-UP",
  "⚡ ADAPTIVE DRILL QUEUED",
  "⚡ WRONG OPTION REMOVED",
  "⚡ TOP-10 LEADERBOARD",
  "⚡ FACULTY EXPORT READY",
  "⚡ CAMPUS RANK UPDATED",
  "⚡ SEASON HIGH SCORE",
  "⚡ NEW PERSONAL BEST",
  "⚡ SPECTATOR JOINED",
  "⚡ SPEED BONUS EARNED",
  "⚡ DOUBLE POINTS POWER-UP",
  "⚡ ADAPTIVE DRILL QUEUED",
  "⚡ WRONG OPTION REMOVED",
  "⚡ TOP-10 LEADERBOARD",
  "⚡ FACULTY EXPORT READY",
  "⚡ CAMPUS RANK UPDATED",
  "⚡ SEASON HIGH SCORE",
  "⚡ NEW PERSONAL BEST",
  "⚡ SPECTATOR JOINED",
];

function StatsSection() {
  return (
    <section className="bg-[#1a1a1a] text-white py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Left ticker */}
          <div className="overflow-hidden h-80 relative">
            <div className="ticker-track space-y-3">
              {leftTicker.map((item, i) => (
                <p
                  key={i}
                  className="text-xs font-mono text-gray-500 tracking-widest uppercase"
                >
                  {item}
                </p>
              ))}
            </div>
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#1a1a1a] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>

          {/* Centre stat */}
          <div className="reveal-scale text-center px-8">
            <p className="text-7xl sm:text-8xl font-extrabold text-indigo-500 leading-none">
              50
            </p>
            <p className="text-gray-400 mt-2 text-lg">
              players per room,
              <br />
              real-time
            </p>
          </div>

          {/* Right ticker */}
          <div className="overflow-hidden h-80 relative">
            <div
              className="ticker-track space-y-3"
              style={{ animationDelay: "-9s" }}
            >
              {rightTicker.map((item, i) => (
                <p
                  key={i}
                  className="text-xs font-mono text-indigo-400 tracking-widest uppercase text-right"
                >
                  {item}
                </p>
              ))}
            </div>
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#1a1a1a] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CUSTOMER STORIES
───────────────────────────────────────────── */
function StoriesSection() {
  return (
    <section className="bg-[#f0efe9] py-28 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="reveal mb-4">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
            Student Stories
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Powering placement wins
            <br />
            at scale
          </h2>
        </div>

        <div className="mt-14 grid sm:grid-cols-3 gap-6">
          {[
            {
              quote:
                "I failed three aptitude rounds in a row. Two weeks of AptiQuiz later I cleared TCS and Infosys the same day.",
              name: "Rohan M.",
              college: "NIT Trichy",
              stat: "3×",
              statLabel: "faster at timed questions",
              delay: "",
            },
            {
              quote:
                "Running a 50-player quiz in my department every Friday. Students are more prepared than ever — and they actually show up.",
              name: "Prof. Anitha K.",
              college: "VIT Vellore",
              stat: "94%",
              statLabel: "average room attendance",
              delay: "delay-200",
            },
            {
              quote:
                "The leaderboard pressure is exactly what you feel in a real aptitude test. Nothing else replicates it.",
              name: "Sneha R.",
              college: "BITS Pilani",
              stat: "Top 5",
              statLabel: "campus-wide league rank",
              delay: "delay-400",
            },
          ].map((s) => (
            <div
              key={s.name}
              className={`reveal ${s.delay} bg-white rounded-3xl border border-gray-200 p-7 flex flex-col justify-between`}
            >
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                &ldquo;{s.quote}&rdquo;
              </p>
              <div>
                <p className="text-3xl font-extrabold text-gray-900">
                  {s.stat}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.statLabel}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-400">{s.college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TRUST / SECURITY SECTION (dark)
───────────────────────────────────────────── */
function TrustSection() {
  return (
    <section className="bg-[#111] text-white py-28 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <div className="reveal-left">
            <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight text-gray-400">
              Built for fairness.
              <br />
              <span className="text-white">Trusted by campuses.</span>
            </h2>
          </div>
          <div className="reveal-right delay-200 text-gray-400 leading-relaxed">
            <p>
              Built with server-authoritative timing, network-delay
              compensation, and cheating resistance at its core, AptiQuiz is
              trusted by placement cells and faculty running real competitive
              events.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: "🛡",
              title: "Server-Authoritative",
              desc: "The server decides when every question starts and ends. No player's device clock ever influences scoring.",
              delay: "",
            },
            {
              icon: "🔒",
              title: "Cheating Resistant",
              desc: "Options shuffled per player. Correct answers never sent before reveal. Late and duplicate submissions silently ignored.",
              delay: "delay-200",
            },
            {
              icon: "⚡",
              title: "Network-Fair",
              desc: "Answers are timestamped server-side on receipt. Two players answering at the same moment on different connections are treated identically.",
              delay: "delay-400",
            },
          ].map((item) => (
            <div key={item.title} className={`reveal ${item.delay}`}>
              <div className="border-l-2 border-indigo-600 pl-6">
                <p className="text-4xl mb-4">{item.icon}</p>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FINAL CTA SECTION (blue)
───────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="bg-indigo-600 py-28 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="reveal mb-6">
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight">
            Turn every student interaction into a placement win.
          </h2>
        </div>
        <div className="reveal delay-200 mb-10">
          <p className="text-indigo-200 text-lg max-w-lg mx-auto leading-relaxed">
            Start for free. Run your first live room in under 2 minutes.
          </p>
        </div>
        <div className="reveal delay-300 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-white text-indigo-600 px-8 py-3.5 text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Request a Demo
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-xl border border-white/40 text-white px-8 py-3.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#111] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 pt-20 pb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white">
                A
              </span>
              <span className="text-xl font-extrabold">AptiQuiz</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              The real-time multiplayer aptitude platform for campus placement
              champions.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-12 text-sm">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-4">
                COMPANY
              </p>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-4">
                PRODUCT
              </p>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-4">
                RESOURCES
              </p>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Github
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    info@aptiquiz.io
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-600">
          <p>© 2026 APTIQUIZ. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="px-4 pb-0 overflow-hidden">
        <p
          className="font-extrabold text-[#f0efe9]/5 leading-none select-none text-[22vw] tracking-tighter"
          aria-hidden="true"
        >
          AptiQuiz
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* Mounts client-side IntersectionObserver for all .reveal elements */}
      <ScrollReveal />

      <AnnouncementBanner />

      {/* ── HERO ── */}
      <section className="bg-[#f0efe9] px-6 lg:px-16 pt-14 pb-0 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Widget row */}
          <div className="reveal">
            <HeroWidget />
          </div>

          {/* Headline */}
          <div className="mt-12 pb-8">
            <h1 className="reveal text-7xl sm:text-8xl font-extrabold text-gray-900 leading-[1.0] tracking-tight mb-6">
              The quiz prep,
              <br />
              multiplied
            </h1>
            <p className="reveal delay-100 text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
              AptiQuiz is the real-time multiplayer platform that runs live
              aptitude battles, spots your weak topics, and delivers
              personalised drills — so you crack campus placements faster.
            </p>
            <div className="reveal delay-200 flex flex-wrap items-center gap-4 pb-16">
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
              >
                Request a Demo
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                See how it works
                <span className="text-gray-400 ml-0.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO MARQUEE ── */}
      <LogoMarquee />

      {/* ── PROBLEM (dark) ── */}
      <ProblemSection />

      {/* ── PRODUCT STACK ── */}
      <ProductStack />

      {/* ── FEATURES / 10x ── */}
      <FeaturesSection />

      {/* ── STATS TICKER (dark) ── */}
      <StatsSection />

      {/* ── STORIES ── */}
      <StoriesSection />

      {/* ── TRUST / SECURITY (dark) ── */}
      <TrustSection />

      {/* ── CTA (blue) ── */}
      <CtaSection />

      {/* ── FOOTER ── */}
      <Footer />
    </>
  );
}
