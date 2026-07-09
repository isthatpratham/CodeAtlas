"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ArrowRight, ExternalLink, Info, Check } from "lucide-react";
import { Modal, Button } from "@codeatlas/ui";
import { validateGitHubUrl } from "@codeatlas/utils";
import { useGraphStore } from "../features/graph/store";
import dynamic from "next/dynamic";

const VisualizerWorkbench = dynamic(
  () =>
    import("../features/graph/components/VisualizerWorkbench").then(
      (mod) => mod.VisualizerWorkbench,
    ),
  {
    loading: () => (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A]">
        <div className="w-1 h-1 rounded-full bg-[#4F8CFF] animate-ping" />
      </div>
    ),
    ssr: false,
  },
);

// ─── Constants ───────────────────────────────────────────────────────────────

const EXAMPLES = [
  "facebook/react",
  "vercel/next.js",
  "nestjs/nest",
  "tailwindlabs/tailwindcss",
  "vuejs/core",
];

// Loading stages mapped to actual store states + intermediate synthetic steps
type Stage = {
  id: string;
  label: string;
  sub: string;
  storeState?: string; // which store state triggers this stage to "complete"
};

const STAGES: Stage[] = [
  {
    id: "connect",
    label: "Connecting to GitHub",
    sub: "Resolving repository metadata...",
  },
  {
    id: "clone",
    label: "Cloning Repository",
    sub: "Fetching source files to local workspace...",
    storeState: "analyzing",
  },
  {
    id: "analyze",
    label: "Analyzing Structure",
    sub: "Walking the file tree and extracting modules...",
    storeState: "analyzing",
  },
  {
    id: "graph",
    label: "Building Dependency Graph",
    sub: "Tracing import relationships between files...",
    storeState: "loading-graph",
  },
  {
    id: "layout",
    label: "Generating Architecture",
    sub: "Computing spatial layout for all nodes...",
    storeState: "loading-graph",
  },
  {
    id: "render",
    label: "Preparing Workspace",
    sub: "Mounting interactive canvas...",
    storeState: "rendering",
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

// ─── Thin separator ───────────────────────────────────────────────────────────

function Rule() {
  return <div className="w-full h-px bg-white/[0.06]" />;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-2.5 select-none">
          <span className="w-6 h-6 rounded bg-[#4F8CFF] flex items-center justify-center text-[10px] font-bold text-white">
            CA
          </span>
          <span className="font-semibold text-sm tracking-widest text-white uppercase">
            CodeAtlas
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <a
            href="https://github.com/isthatpratham/CodeAtlas"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#757575] hover:text-white transition-colors duration-150 rounded-md hover:bg-white/5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="px-3 py-1.5 text-xs font-medium text-[#757575] hover:text-white transition-colors duration-150 rounded-md hover:bg-white/5"
          >
            Documentation
          </a>
        </nav>
      </div>
    </motion.header>
  );
}

// ─── Repository Input ─────────────────────────────────────────────────────────

function RepoInput({
  url,
  urlError,
  isLoading,
  onChange,
  onSubmit,
  onSelectExample,
  compact = false,
}: {
  url: string;
  urlError: string | null;
  isLoading: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectExample: (s: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit}>
        <div
          className={`flex items-center bg-[#111111] border border-white/[0.1] rounded-xl overflow-hidden transition-all duration-200 ${isLoading
            ? "opacity-60 pointer-events-none"
            : "focus-within:border-[#4F8CFF]/50 focus-within:shadow-[0_0_0_3px_rgba(79,140,255,0.08)]"
            }`}
        >
          <div className="pl-4 pr-3 shrink-0">
            <Github className="w-4 h-4 text-[#444444]" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            placeholder="github.com/facebook/react"
            className="flex-1 bg-transparent text-sm text-white placeholder-[#3A3A3A] py-3.5 pr-2 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="m-1.5 px-5 py-2.5 bg-[#4F8CFF] hover:bg-[#3d7de8] disabled:bg-[#4F8CFF]/40 text-white text-xs font-semibold rounded-lg transition-colors duration-150 flex items-center gap-1.5 shrink-0 select-none"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {urlError && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 mt-2.5 text-[#FF5F56] text-xs font-medium pl-1"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              {urlError}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {!compact && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onSelectExample(ex)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#666666] hover:text-white hover:border-white/[0.18] hover:bg-white/[0.07] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-medium transition-all duration-150 cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Premium Loading Overlay ─────────────────────────────────────────────────
//
// Maps actual store states to a 6-stage visual sequence.
// Stages advance automatically on a timer, with real state changes
// acting as anchors that lock in completed stages.

function useLoadingStages(loadingState: string): {
  activeIndex: number;
  completedIndices: Set<number>;
} {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Map store state → minimum stage index that must be showing
  const stateFloor: Record<string, number> = {
    analyzing: 2,      // at least "Analyzing Structure"
    "loading-graph": 4, // at least "Generating Architecture"
    rendering: 5,       // "Preparing Workspace"
  };

  React.useEffect(() => {
    const floor = stateFloor[loadingState] ?? 0;

    // Jump to the floor immediately if we're behind
    setActiveIndex((prev) => Math.max(prev, floor));

    // Advance one step every 1.4 s up to the floor
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const target = stateFloor[loadingState] ?? 0;
        if (prev < target) return prev + 1;
        return prev;
      });
    }, 1400);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  const completedIndices = new Set(
    Array.from({ length: activeIndex }, (_, i) => i),
  );

  return { activeIndex, completedIndices };
}

function LoadingOverlay({
  loadingState,
  repoUrl,
  onCancel,
}: {
  loadingState: string;
  repoUrl: string;
  onCancel: () => void;
}) {
  const { activeIndex, completedIndices } = useLoadingStages(loadingState);
  const repoName = repoUrl.replace("https://github.com/", "").replace("http://github.com/", "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center"
    >
      {/* Subtle background vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(79,140,255,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 text-center">
        {/* Repository label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-10 flex items-center gap-2"
        >
          <Github className="w-4 h-4 text-[#555555]" />
          <span className="text-sm font-mono text-[#555555] truncate max-w-xs">
            {repoName || "Analyzing repository"}
          </span>
        </motion.div>

        {/* Stage list */}
        <div className="w-full flex flex-col gap-4 text-left mb-10">
          {STAGES.map((stage, i) => {
            const isDone = completedIndices.has(i);
            const isActive = i === activeIndex;
            const isPending = i > activeIndex;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                className="flex items-center gap-4"
              >
                {/* Status indicator */}
                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    >
                      <Check className="w-4 h-4 text-[#3DDC84]" />
                    </motion.div>
                  ) : isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-pulse" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/[0.1]" />
                  )}
                </div>

                {/* Stage text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-none mb-1 transition-colors duration-300 ${isDone
                      ? "text-[#555555]"
                      : isActive
                        ? "text-white"
                        : "text-[#333333]"
                      }`}
                  >
                    {stage.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-[#4F8CFF] truncate"
                    >
                      {stage.sub}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress track */}
        <div className="w-full h-px bg-white/[0.06] rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-[#4F8CFF] rounded-full"
            animate={{
              width: `${Math.round(((activeIndex + 1) / STAGES.length) * 100)}%`,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-xs text-[#3A3A3A] hover:text-[#757575] transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Browser Window Shell ─────────────────────────────────────────────────────

function BrowserShell({
  url,
  children,
  tall = false,
}: {
  url: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="w-full max-w-lg">
      <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#111111]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/60" />
          <div className="flex-1 mx-3">
            <div className="mx-auto w-48 h-4 rounded bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-center">
              <span className="text-[9px] text-[#3A3A3A] font-mono">{url}</span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className={`relative overflow-hidden ${tall ? "h-64" : "h-52"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Showcase 1 · Interactive Repository Map ─────────────────────────────────
// Animated node graph: nodes fade in, then a selection pulse plays

const MAP_NODES = [
  { x: "10%", y: "20%", w: 108, label: "packages/", accent: true, delay: 0 },
  { x: "28%", y: "8%", w: 90, label: "react-dom/", accent: false, delay: 0.08 },
  { x: "50%", y: "6%", w: 104, label: "react/src/", accent: false, delay: 0.16 },
  { x: "70%", y: "12%", w: 84, label: "scheduler/", accent: false, delay: 0.24 },
  { x: "18%", y: "50%", w: 96, label: "reconciler/", accent: false, delay: 0.32 },
  { x: "42%", y: "42%", w: 124, label: "ReactFiber.js", accent: true, delay: 0.4 },
  { x: "66%", y: "44%", w: 88, label: "hooks/", accent: false, delay: 0.48 },
  { x: "12%", y: "74%", w: 76, label: "events/", accent: false, delay: 0.56 },
  { x: "36%", y: "70%", w: 100, label: "shared/", accent: false, delay: 0.64 },
  { x: "62%", y: "72%", w: 84, label: "server/", accent: false, delay: 0.72 },
];

function ShowcaseMap() {
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setPulse(true), 2400);
    const t2 = setTimeout(() => setPulse(false), 4000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A]">
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Edge lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {[
          { x1: "16%", y1: "28%", x2: "44%", y2: "45%", blue: true },
          { x1: "53%", y1: "14%", x2: "44%", y2: "42%", blue: true },
          { x1: "72%", y1: "20%", x2: "68%", y2: "44%", blue: false },
          { x1: "22%", y1: "58%", x2: "38%", y2: "70%", blue: false },
          { x1: "50%", y1: "53%", x2: "38%", y2: "70%", blue: true },
        ].map((e, i) => (
          <motion.line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.blue ? "#4F8CFF" : "#3A3A3A"}
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: e.blue ? (pulse ? 0.6 : 0.18) : 0.12 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
          />
        ))}
      </svg>
      {/* Nodes */}
      {MAP_NODES.map((node) => (
        <motion.div
          key={node.label}
          className="absolute"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: node.accent && pulse ? 1.04 : 1 }}
          transition={{ delay: 0.3 + node.delay, duration: 0.4 }}
        >
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded border text-[10px] font-mono transition-all duration-500 ${node.accent
              ? pulse
                ? "bg-[#4F8CFF]/20 border-[#4F8CFF]/50 text-[#4F8CFF] shadow-[0_0_16px_rgba(79,140,255,0.2)]"
                : "bg-[#4F8CFF]/10 border-[#4F8CFF]/25 text-[#4F8CFF]"
              : "bg-[#111111] border-white/[0.07] text-[#484848]"
              }`}
            style={{ width: node.w }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${node.accent ? "bg-[#4F8CFF]" : "bg-[#2A2A2A]"}`}
            />
            <span className="truncate">{node.label}</span>
          </div>
        </motion.div>
      ))}
      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </div>
  );
}

// ─── Showcase 2 · Dependency Graph ───────────────────────────────────────────
// Edges are computed from measured node bounding boxes so every line begins
// and ends exactly at the node border — never floating, never overshooting.

// Node layout: id maps to (cx%, cy%) as fractions of the container
const DEP_NODE_LAYOUT: Record<string, { cx: number; cy: number; label: string; selected?: boolean; connected?: boolean }> = {
  center: { cx: 0.50, cy: 0.44, label: "ReactFiber.js", selected: true },
  a:      { cx: 0.13, cy: 0.16, label: "scheduler.js",  connected: true },
  b:      { cx: 0.70, cy: 0.10, label: "ReactDOM.js",   connected: true },
  c:      { cx: 0.80, cy: 0.55, label: "hooks.js",      connected: true },
  d:      { cx: 0.18, cy: 0.68, label: "events.js",     connected: true },
  e:      { cx: 0.55, cy: 0.78, label: "shared.js" },
  f:      { cx: 0.07, cy: 0.44, label: "context.js" },
};

// Edges connect center → each connected node
const DEP_EDGE_PAIRS: Array<{ from: string; to: string }> = [
  { from: "center", to: "a" },
  { from: "center", to: "b" },
  { from: "center", to: "c" },
  { from: "center", to: "d" },
];

// Given a rect and a direction vector, find the exact point on the rect border
// in the direction of (dx, dy) from the center.
function rectBorderPoint(
  rect: { x: number; y: number; w: number; h: number },
  dx: number,
  dy: number,
): { x: number; y: number } {
  if (dx === 0 && dy === 0) return { x: rect.x, y: rect.y };
  const hw = rect.w / 2;
  const hh = rect.h / 2;
  // How far can we go in x vs y before hitting the border?
  const tx = hw / Math.abs(dx);
  const ty = hh / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: rect.x + dx * t, y: rect.y + dy * t };
}

function ShowcaseDependency() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = React.useState<Array<{ id: string; d: string }>>([]);
  const [lit, setLit] = React.useState(0);

  // Measure nodes and compute edge paths after render
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const compute = () => {
      const cRect = container.getBoundingClientRect();
      if (cRect.width === 0) return;

      const nodeRects: Record<string, { x: number; y: number; w: number; h: number }> = {};
      for (const [id, el] of Object.entries(nodeRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        nodeRects[id] = {
          x: r.left - cRect.left + r.width / 2,
          y: r.top  - cRect.top  + r.height / 2,
          w: r.width,
          h: r.height,
        };
      }

      const computed = DEP_EDGE_PAIRS.map(({ from, to }) => {
        const src = nodeRects[from];
        const tgt = nodeRects[to];
        if (!src || !tgt) return null;

        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;

        const ux = dx / len;
        const uy = dy / len;

        // Start point: on the border of the source rect, heading toward target
        const start = rectBorderPoint(src, ux, uy);
        // End point: on the border of the target rect, heading away from source
        const end   = rectBorderPoint(tgt, -ux, -uy);

        return {
          id: `${from}-${to}`,
          d: `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
        };
      }).filter(Boolean) as Array<{ id: string; d: string }>;

      setPaths(computed);
    };

    // Compute immediately and on resize
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Cycle lit edges
  React.useEffect(() => {
    const t = setInterval(
      () => setLit((p) => (p + 1) % (DEP_EDGE_PAIRS.length + 1)),
      900,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#0A0A0A]">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Computed edge paths — perfectly anchored to node borders */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Reusable dash pattern so spacing never stretches */}
          <pattern id="depDash" patternUnits="userSpaceOnUse" width="8" height="1">
            <line x1="0" y1="0.5" x2="5" y2="0.5" stroke="inherit" strokeWidth="1" />
          </pattern>
        </defs>

        {paths.map(({ id, d }, i) => {
          const active = lit > i;
          return (
            <path
              key={id}
              d={d}
              fill="none"
              stroke={active ? "#3DDC84" : "#252525"}
              strokeWidth={active ? 1.5 : 1}
              strokeDasharray="5 4"
              strokeLinecap="round"
              style={{ transition: "stroke 0.35s ease, stroke-width 0.35s ease" }}
            />
          );
        })}
      </svg>

      {/* Nodes — each inner div is the measured element */}
      {Object.entries(DEP_NODE_LAYOUT).map(([id, n]) => (
        <div
          key={id}
          className="absolute"
          style={{
            left: `${n.cx * 100}%`,
            top:  `${n.cy * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => { nodeRefs.current[id] = el; }}
            className={`px-2.5 py-1 rounded border text-[10px] font-mono whitespace-nowrap transition-all duration-300 ${
              n.selected
                ? "bg-[#4F8CFF]/20 border-[#4F8CFF]/60 text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.25)]"
                : n.connected
                  ? "bg-[#3DDC84]/10 border-[#3DDC84]/30 text-[#3DDC84]"
                  : "bg-[#111111] border-white/[0.06] text-[#383838]"
            }`}
          >
            {n.label}
          </div>
        </div>
      ))}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </div>
  );
}

// ─── Showcase 3 · Instant Search ─────────────────────────────────────────────
// A simulated search input that types characters, shows results, then clears

const SEARCH_RESULTS = [
  { name: "ReactFiber.js", path: "packages/react-reconciler/src/", file: true },
  { name: "ReactFiberHooks.js", path: "packages/react-reconciler/src/", file: true },
  { name: "ReactFiberRoot.js", path: "packages/react-reconciler/src/", file: true },
];

const SEARCH_PHRASE = "ReactFiber";

function ShowcaseSearch() {
  const [chars, setChars] = React.useState(0);
  const [showResults, setShowResults] = React.useState(false);

  React.useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      i++;
      setChars(i);
      if (i === SEARCH_PHRASE.length) {
        clearInterval(typing);
        setTimeout(() => setShowResults(true), 300);
        // Loop: clear after 3s
        setTimeout(() => {
          setShowResults(false);
          setChars(0);
        }, 3200);
      }
    }, 110);
    return () => clearInterval(typing);
  }, [showResults]); // re-run when showResults resets to false (loop)

  const typed = SEARCH_PHRASE.slice(0, chars);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] p-4 flex flex-col gap-3">
      {/* Simulated search bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-white/[0.1] rounded-lg">
        <div className="w-3.5 h-3.5 text-[#444444]">
          <svg viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-xs font-mono text-white tracking-wide">
          {typed}
          <span className="inline-block w-px h-3 bg-[#4F8CFF] ml-0.5 animate-pulse" />
        </span>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1"
          >
            {SEARCH_RESULTS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[10px] font-mono ${i === 0 ? "bg-[#4F8CFF]/10 border border-[#4F8CFF]/20" : "bg-[#111111] border border-white/[0.05]"
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? "bg-[#4F8CFF]" : "bg-[#333333]"}`} />
                <span className={i === 0 ? "text-[#4F8CFF]" : "text-[#555555]"}>{r.name}</span>
                <span className="text-[#333333] truncate ml-auto">{r.path}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </div>
  );
}

// ─── Showcase 4 · Inspector Panel ────────────────────────────────────────────

function ShowcaseInspector() {
  const fields = [
    { label: "File", value: "ReactFiber.js" },
    { label: "Path", value: "packages/react-reconciler/src/" },
    { label: "Language", value: "JavaScript" },
    { label: "Size", value: "42.8 KB" },
    { label: "Imports", value: "18 modules" },
    { label: "Imported by", value: "6 files" },
  ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#4F8CFF]" />
        <span className="text-[11px] font-semibold text-[#4F8CFF] uppercase tracking-wider">
          Inspector
        </span>
      </div>
      {fields.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
          className="flex justify-between items-center py-1.5 border-b border-white/[0.04]"
        >
          <span className="text-[10px] text-[#444444] font-medium">{f.label}</span>
          <span className="text-[10px] text-[#888888] font-mono">{f.value}</span>
        </motion.div>
      ))}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </div>
  );
}

// ─── Feature Row ──────────────────────────────────────────────────────────────

type ShowcaseVariant = "map" | "dependency" | "search" | "inspector";

function FeatureRow({
  label,
  headline,
  body,
  showcase,
  reverse = false,
}: {
  label: string;
  headline: string;
  body: string;
  showcase: ShowcaseVariant;
  reverse?: boolean;
}) {
  const showcaseMap: Record<ShowcaseVariant, React.ReactNode> = {
    map: <ShowcaseMap />,
    dependency: <ShowcaseDependency />,
    search: <ShowcaseSearch />,
    inspector: <ShowcaseInspector />,
  };

  const urlMap: Record<ShowcaseVariant, string> = {
    map: "codeatlas — repository map",
    dependency: "codeatlas — dependency graph",
    search: "codeatlas — search",
    inspector: "codeatlas — inspector",
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Text */}
      <div className="flex-1 flex flex-col gap-4">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[#4F8CFF] uppercase">
          {label}
        </span>
        <h3 className="text-2xl font-bold text-white leading-snug max-w-xs">
          {headline}
        </h3>
        <p className="text-sm text-[#666666] leading-relaxed max-w-sm">{body}</p>
      </div>

      {/* Animated showcase window */}
      <div className="flex-1 w-full max-w-lg">
        <BrowserShell url={urlMap[showcase]}>
          {showcaseMap[showcase]}
        </BrowserShell>
      </div>
    </motion.div>
  );
}

// ─── How It Works Step ────────────────────────────────────────────────────────

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-semibold tracking-[0.2em] text-[#4F8CFF] uppercase">
        {number}
      </span>
      <h3 className="text-lg font-semibold text-white leading-snug">{title}</h3>
      <p className="text-sm text-[#666666] leading-relaxed max-w-56">
        {description}
      </p>
    </div>
  );
}

// ─── Product Preview (large canvas mock) ─────────────────────────────────────

function ProductPreview() {
  return (
    <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-[#111111]">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56]/60" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/60" />
        <div className="w-3 h-3 rounded-full bg-[#27C93F]/60" />
        <div className="flex-1 mx-4">
          <div className="mx-auto w-52 h-5 rounded bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-center">
            <span className="text-[10px] text-[#3A3A3A] font-mono">
              codeatlas.app — facebook/react
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative h-[480px] bg-[#0A0A0A] overflow-hidden">
        <ShowcaseMap />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent flex items-end justify-center pb-4">
          <p className="text-xs text-[#3A3A3A] font-medium">
            facebook/react — 3,400+ files mapped interactively
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [url, setUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = React.useState("");

  const { repository, loadingState, errorMessage, analyzeRepository, reset } =
    useGraphStore();

  const handleExplore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlError("Please enter a GitHub repository URL.");
      return;
    }
    const fullUrl = url.includes("github.com")
      ? url
      : `https://github.com/${url}`;
    if (!validateGitHubUrl(fullUrl)) {
      setUrlError(
        "That doesn't look like a valid GitHub URL — try: https://github.com/facebook/react",
      );
      return;
    }
    setUrlError(null);
    setSubmittedUrl(fullUrl);
    analyzeRepository(fullUrl);
  };

  const handleSelectExample = (example: string) => {
    setUrl(`https://github.com/${example}`);
    setUrlError(null);
  };

  const handleCancel = () => {
    reset();
    setSubmittedUrl("");
  };

  const isLoading = ["analyzing", "loading-graph", "rendering"].includes(
    loadingState,
  );

  // Workspace view
  if (loadingState === "ready" && repository) {
    return <VisualizerWorkbench />;
  }

  return (
    <>
      {/* ── PREMIUM LOADING OVERLAY ─────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <LoadingOverlay
            loadingState={loadingState}
            repoUrl={submittedUrl}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* ── ERROR MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loadingState === "error" && errorMessage && (
          <Modal isOpen onClose={() => { reset(); setSubmittedUrl(""); }}>
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF5F56]/10 border border-[#FF5F56]/20 flex items-center justify-center">
                <Info className="w-4 h-4 text-[#FF5F56]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  Analysis failed
                </h3>
                <p className="text-[#666666] text-xs max-w-xs leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button onClick={() => { reset(); setSubmittedUrl(""); }} size="sm">
                Dismiss
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── LANDING PAGE ────────────────────────────────────────────────── */}
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white selection:bg-[#4F8CFF]/25">
        <Navbar />

        {/* SECTION 1 · HERO */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[92vh] px-6 overflow-hidden">
          {/* Subtle grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[440px] bg-[#4F8CFF] rounded-full blur-[180px] opacity-[0.055]"
          />

          <div className="relative z-10 flex flex-col items-center max-w-4xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-[11px] font-semibold tracking-[0.25em] text-[#4F8CFF] uppercase mb-8"
            >
              GitHub Repository Visualizer
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.08}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-extrabold tracking-tight leading-[1.05] text-white mb-7"
            >
              Software has
              <br />
              architecture.
              <br />
              <span className="text-[#4F8CFF]">Now you can see it.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.16}
              className="text-base sm:text-lg text-[#666666] max-w-lg leading-relaxed mb-12 font-medium"
            >
              Paste any public GitHub repository. CodeAtlas maps its structure
              into an interactive graph you can explore, search, and navigate.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.24}
              className="w-full"
            >
              <RepoInput
                url={url}
                urlError={urlError}
                isLoading={isLoading}
                onChange={setUrl}
                onSubmit={handleExplore}
                onSelectExample={handleSelectExample}
              />
            </motion.div>
          </div>
        </section>

        <Rule />

        {/* SECTION 2 · PRODUCT PREVIEW */}
        <section className="px-6 py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="text-center mb-14"
            >
              <p className="text-[11px] font-semibold tracking-[0.25em] text-[#4F8CFF] uppercase mb-4">
                The product
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                A codebase. As a map.
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        <Rule />

        {/* SECTION 3 · HOW IT WORKS */}
        <section className="px-6 py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-20"
            >
              <p className="text-[11px] font-semibold tracking-[0.25em] text-[#4F8CFF] uppercase mb-4">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-sm leading-tight">
                Three steps. Zero configuration.
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-16"
            >
              <HowItWorksStep
                number="01"
                title="Paste a repository URL"
                description="Any public GitHub repository. No account, no setup, no configuration required."
              />
              <HowItWorksStep
                number="02"
                title="We analyze the structure"
                description="CodeAtlas clones the repo, walks the file tree, and detects every import relationship."
              />
              <HowItWorksStep
                number="03"
                title="Explore like a map"
                description="Navigate the interactive graph. Search files, inspect dependencies, and understand the codebase at a glance."
              />
            </motion.div>
          </div>
        </section>

        <Rule />

        {/* SECTION 4 · ANIMATED FEATURE ROWS */}
        <section className="px-6 py-32">
          <div className="max-w-6xl mx-auto flex flex-col gap-28 lg:gap-40">
            <FeatureRow
              label="Interactive map"
              headline="Navigate your codebase like Google Maps."
              body="Every folder and file becomes a node. Zoom, pan, and move through thousands of files without losing context."
              showcase="map"
            />
            <FeatureRow
              reverse
              label="Dependency graph"
              headline="See what imports what."
              body="Directed edges trace every import statement. In one glance, you can understand a module's full dependency chain."
              showcase="dependency"
            />
            <FeatureRow
              label="Instant search"
              headline="Find any file in under a second."
              body="Type a filename, press enter, and the canvas navigates directly to that node. No scrolling through trees."
              showcase="search"
            />
            <FeatureRow
              reverse
              label="Code inspector"
              headline="Inspect without switching context."
              body="Select any node to see its file path, language, size, import count, and related files — without opening a new tab."
              showcase="inspector"
            />
          </div>
        </section>

        <Rule />

        {/* SECTION 5 · CLOSING CTA */}
        <section className="px-6 py-40">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Start with any
                <br />
                <span className="text-[#4F8CFF]">public repository.</span>
              </h2>
              <p className="text-[#666666] text-base max-w-md leading-relaxed">
                No sign-up. No rate limits. Just paste and explore.
              </p>
              <RepoInput
                url={url}
                urlError={urlError}
                isLoading={isLoading}
                onChange={setUrl}
                onSubmit={handleExplore}
                onSelectExample={handleSelectExample}
                compact
              />
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.06] py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#3A3A3A] text-xs">
              <span className="font-semibold text-[#4F8CFF]">v1.0.0</span>
              <span>·</span>
              <span>© 2026 CodeAtlas by <a href="https://github.com/isthatpratham" target="_blank" className="hover:text-white transition-colors">Pratham</a></span>
            </div>
            <div className="flex items-center gap-5 text-xs text-[#444444]">
              <a
                href="https://github.com/isthatpratham/CodeAtlas"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-white transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
