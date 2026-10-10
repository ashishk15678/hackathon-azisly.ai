"use client";

import { useEffect, useState } from "react";

const steps = [
  { label: "JOIN ROOM WITH CODE", done: true },
  { label: "LOBBY FILLS (50 PLAYERS)", done: true },
  { label: "HOST STARTS THE GAME", done: true },
  { label: "QUESTION APPEARS FOR ALL", done: false },
  { label: "RACE AGAINST THE CLOCK", done: false },
  { label: "LIVE LEADERBOARD UPDATES", done: false },
];

const aiDecisions = [
  "SPEED-WEIGHTED SCORING ACTIVE",
  "OPTION ORDER SHUFFLED PER PLAYER",
  "WEAK-TOPIC DETECTION RUNNING",
];

export function HeroWidget() {
  const [activeStep, setActiveStep] = useState(2);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDrawn(true), 400);
    const t2 = setInterval(() => {
      setActiveStep((s) => (s + 1) % steps.length);
    }, 1800);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[380px] select-none pointer-events-none">
      {/* SVG connector line */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 900 380"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 140 60 C 220 60, 240 150, 320 150 L 560 150 C 640 150, 660 150, 740 150"
          stroke="#3b5bff"
          strokeWidth="1.5"
          strokeDasharray="600"
          strokeDashoffset={drawn ? "0" : "600"}
          style={{ transition: "stroke-dashoffset 1.6s ease 0.4s" }}
          fill="none"
        />
      </svg>

      {/* ASK AGENT bubble */}
      <div className="absolute top-0 left-0 float-card">
        <div className="text-[9px] font-semibold text-indigo-600 tracking-widest uppercase flex items-center gap-1 mb-2 border border-indigo-200 rounded-full px-2 py-0.5 w-fit bg-white shadow-sm">
          <span>⚡</span> Ask Agent
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-52 text-xs text-gray-700 leading-relaxed">
          <p>
            Find which aptitude topics our class drops marks on and generate
            a 10-question targeted drill before Friday's placement drive
          </p>
          <div className="mt-3 flex justify-end">
            <span className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
              ↑
            </span>
          </div>
        </div>
      </div>

      {/* AGENT WORKFLOW card */}
      <div
        className="absolute bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-4 w-52 text-[10px] font-mono text-gray-500"
        style={{ top: "120px", left: "220px" }}
      >
        <p className="text-[9px] font-semibold text-indigo-500 mb-2 tracking-widest uppercase flex items-center gap-1">
          <span>⚡</span> Agent Workflow
        </p>
        <ul className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                className={
                  i <= activeStep
                    ? "text-indigo-600 font-bold"
                    : "text-gray-300"
                }
              >
                {i < activeStep ? "✓" : i === activeStep ? "○" : "○"}
              </span>
              <span
                className={
                  i <= activeStep
                    ? "text-gray-700 uppercase"
                    : "uppercase text-gray-300"
                }
              >
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI DECISIONING card */}
      <div
        className="absolute bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-4 w-48 text-[9px] font-mono text-gray-500 float-card-slow"
        style={{ top: "100px", right: "240px" }}
      >
        <p className="text-[9px] font-semibold text-indigo-500 mb-2 tracking-widest uppercase flex items-center gap-1">
          <span>⚡</span> AI Decisioning
        </p>
        <ul className="space-y-2">
          {aiDecisions.map((d) => (
            <li key={d} className="flex items-start gap-1">
              <span className="text-indigo-500 mt-px">⚡</span>
              <span className="leading-tight">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Live quiz preview card */}
      <div
        className="absolute bg-gray-900 rounded-2xl shadow-2xl overflow-hidden text-white w-48 float-card"
        style={{ top: "0px", right: "0px" }}
      >
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-700 p-4">
          <p className="text-[10px] text-indigo-200 mb-1 font-mono">LIVE · 42 PLAYERS</p>
          <p className="text-sm font-bold leading-snug">
            Quantitative<br />Sprint — Q7/20
          </p>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[9px] text-gray-400 font-mono">LEADERBOARD</p>
          {[
            { name: "Priya S.", pts: 860, up: true },
            { name: "Arjun K.", pts: 840, up: false },
            { name: "Sneha R.", pts: 810, up: true },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between text-[10px]">
              <span className="text-gray-300">{p.name}</span>
              <div className="flex items-center gap-1">
                <span className={p.up ? "text-green-400" : "text-red-400"}>
                  {p.up ? "▲" : "▼"}
                </span>
                <span className="text-white font-semibold">{p.pts}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: "35%", transition: "width 1s ease" }}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1">14s remaining</p>
        </div>
      </div>
    </div>
  );
}
