"use client";

import React from "react";
import { useGraphStore } from "../store";
import { PERSPECTIVES, Perspective } from "../layouts";

/**
 * PerspectiveSwitcher — premium segmented control for the toolbar.
 *
 * Renders a compact pill control with three segments: Architecture,
 * Dependency, Radial. The active segment is highlighted with a blue
 * indicator pill. Switching never reloads the page; the store
 * recomputes node positions from the already-fetched rawNodes/rawEdges.
 */
export function PerspectiveSwitcher() {
  const { activePerspective, setPerspective, rawNodes } = useGraphStore();
  const disabled = rawNodes.length === 0;

  return (
    <div
      className="flex items-center bg-[#0F0F0F] border border-white/[0.08] rounded-lg p-0.5 gap-0.5"
      role="group"
      aria-label="Graph perspective"
    >
      {PERSPECTIVES.map((p) => {
        const isActive = activePerspective === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPerspective(p.id as Perspective)}
            disabled={disabled}
            title={p.description}
            className={`relative px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 select-none outline-none focus-visible:ring-1 focus-visible:ring-[#4F8CFF]/50 disabled:opacity-30 disabled:pointer-events-none ${
              isActive
                ? "bg-[#1A2744] text-[#4F8CFF] shadow-[0_1px_4px_rgba(79,140,255,0.2)]"
                : "text-[#555555] hover:text-[#888888] hover:bg-white/[0.04]"
            }`}
            aria-pressed={isActive}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
