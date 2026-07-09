import React from "react";
import { useViewport } from "@xyflow/react";
import { useGraphStore } from "../store";
import { BarChart2, Eye, Compass, GitBranch } from "lucide-react";

export function StatusBar() {
  const { repository, statistics, selectedNodeId, rawNodes } = useGraphStore();
  const { zoom } = useViewport();

  const selectedNode = rawNodes.find((n) => n.id === selectedNodeId);
  const zoomPercent = Math.round(zoom * 100);

  if (!repository) return null;

  return (
    <div className="h-8 border-t border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] px-4 flex items-center justify-between text-[11px] text-[#757575] select-none shrink-0 font-montserrat tracking-wide">
      {/* Left section: Repo & layout details */}
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-[#B5B5B5] font-semibold">
          <GitBranch className="w-3.5 h-3.5 mr-1.5 text-[#4F8CFF] shrink-0" />
          {repository.fullName}
        </span>
        <span className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />
        <span className="flex items-center">
          <Compass className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          Layout: Nested Grid
        </span>
      </div>

      {/* Middle section: Selection details */}
      <div className="truncate max-w-sm">
        {selectedNode ? (
          <span className="flex items-center text-[#B5B5B5]">
            <Eye className="w-3.5 h-3.5 mr-1.5 text-[#3DDC84] shrink-0" />
            Selected:{" "}
            <span className="font-mono ml-1 font-semibold break-all truncate">
              {selectedNode.path || "/"}
            </span>
          </span>
        ) : (
          <span>No node selected</span>
        )}
      </div>

      {/* Right section: Nodes & Zoom counts */}
      <div className="flex items-center space-x-4">
        <span className="flex items-center">
          <BarChart2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          Nodes: {statistics?.totalNodes || 0}
        </span>
        <span className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />
        <span className="flex items-center">Zoom: {zoomPercent}%</span>
      </div>
    </div>
  );
}
