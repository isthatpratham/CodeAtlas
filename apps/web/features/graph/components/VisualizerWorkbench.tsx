import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ArrowLeft, Github } from "lucide-react";
import { Button } from "@codeatlas/ui";
import { useGraphStore } from "../store";

import { SearchBar } from "./SearchBar";
import { SidebarTree } from "./SidebarTree";
import { InspectorPanel } from "./InspectorPanel";
import { StatusBar } from "./StatusBar";
import { GraphCanvas } from "./GraphCanvas";

export function VisualizerWorkbench() {
  const { repository, reset } = useGraphStore();

  if (!repository) return null;

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden font-montserrat">
        {/* Header Navigation */}
        <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]/85 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={reset}
              className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] text-[#757575] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit</span>
            </button>
            <span className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
            <h1 className="font-bold text-sm tracking-wider text-white">
              CodeAtlas <span className="text-[#4F8CFF] font-mono text-[10px] ml-1 uppercase">Visualizer</span>
            </h1>
          </div>

          {/* Search bar in the header center */}
          <SearchBar />

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(repository.url, "_blank")}
              className="flex items-center gap-1.5 text-xs h-8"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Open Git</span>
            </Button>
          </div>
        </header>

        {/* Workbench Split Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0A0A0A]">
          {/* Collapsible Sidebar File tree */}
          <SidebarTree />

          {/* Interactive Flow Canvas */}
          <GraphCanvas />

          {/* Read-only inspector panel */}
          <InspectorPanel />
        </div>

        {/* Status Bar */}
        <StatusBar />
      </div>
    </ReactFlowProvider>
  );
}
