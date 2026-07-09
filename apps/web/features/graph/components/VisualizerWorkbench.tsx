import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ArrowLeft, Github, PanelRightOpen } from "lucide-react";
import { Button } from "@codeatlas/ui";
import { useGraphStore } from "../store";

import { SearchBar } from "./SearchBar";
import { SidebarTree } from "./SidebarTree";
import { InspectorPanel } from "./InspectorPanel";
import { StatusBar } from "./StatusBar";
import { GraphCanvas } from "./GraphCanvas";
import { PerspectiveSwitcher } from "./PerspectiveSwitcher";

export function VisualizerWorkbench() {
  const { repository, selectedNodeId, reset } = useGraphStore();

  if (!repository) return null;

  const hasSelection = !!selectedNodeId;

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden font-montserrat">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="h-12 border-b border-white/[0.07] bg-[#0A0A0A] px-4 flex items-center justify-between shrink-0 select-none z-10">
          {/* Left: back button + branding + repo name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/[0.05] text-[#666666] hover:text-white transition-colors text-xs font-semibold shrink-0"
              title="Back to landing page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit
            </button>

            <span className="h-4 w-px bg-white/[0.08] shrink-0" />

            <div className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="CodeAtlas Logo"
                className="w-5 h-5 object-contain"
              />
              <h1 className="font-semibold text-xs tracking-widest text-white uppercase">
                CodeAtlas
              </h1>
            </div>

            <span className="h-4 w-px bg-white/[0.08] shrink-0" />

            <span className="text-xs text-[#555555] font-mono truncate max-w-[180px]">
              {repository.fullName}
            </span>
          </div>

          {/* Center: perspective switcher + search */}
          <div className="flex items-center gap-3">
            <PerspectiveSwitcher />
            <SearchBar />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!hasSelection && (
              <span className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#3A3A3A]">
                <PanelRightOpen className="w-3.5 h-3.5" />
                Select a node to inspect
              </span>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(repository.url, "_blank")}
              className="flex items-center gap-1.5 text-xs h-7"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open on GitHub</span>
            </Button>
          </div>
        </header>

        {/* ── Main workbench ─────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Resizable sidebar tree */}
          <SidebarTree />

          {/* Graph canvas — fills all remaining space */}
          <GraphCanvas />

          {/* Inspector — collapses to nothing when no node is selected */}
          <InspectorPanel />
        </div>

        {/* ── Status bar ────────────────────────────────────────────────── */}
        <StatusBar />
      </div>
    </ReactFlowProvider>
  );
}
