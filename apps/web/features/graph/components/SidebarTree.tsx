import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useGraphStore } from "../store";
import { GraphNode } from "@codeatlas/types";

export function SidebarTree() {
  const { rawNodes, selectedNodeId, setSelectedNodeId } = useGraphStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "/": true,
  });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Group nodes by parentId
  const parentToChildren = new Map<string, GraphNode[]>();
  const nodesMap = new Map<string, GraphNode>();

  for (const node of rawNodes) {
    nodesMap.set(node.id, node);
    if (node.type !== "root") {
      const pid = node.parentId || "/";
      if (!parentToChildren.has(pid)) {
        parentToChildren.set(pid, []);
      }
      parentToChildren.get(pid)!.push(node);
    }
  }

  // Sort children: folders first, then files
  for (const list of parentToChildren.values()) {
    list.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
  };

  // Auto-scroll selected node into view
  useEffect(() => {
    if (selectedNodeId) {
      const element = document.getElementById(`tree-node-${selectedNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedNodeId]);

  const renderNode = (nodeId: string, depth: number): React.ReactNode => {
    const node = nodesMap.get(nodeId);
    if (!node) return null;

    const isFolder = node.type === "folder" || node.type === "root";
    const isNodeExpanded = expanded[nodeId];
    const isSelected = selectedNodeId === nodeId;
    const children = parentToChildren.get(nodeId) || [];

    return (
      <div key={nodeId} className="select-none">
        {/* Node Line */}
        <div
          id={`tree-node-${nodeId}`}
          onClick={() => handleNodeClick(nodeId)}
          className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? "bg-[#4F8CFF]/15 text-[#4F8CFF] font-medium"
              : "text-[#B5B5B5] hover:bg-[rgba(255,255,255,0.03)] hover:text-white"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isFolder ? (
            <>
              <button
                onClick={(e) => toggleExpand(nodeId, e)}
                className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.05)] mr-1 text-[#757575] hover:text-white shrink-0"
              >
                {isNodeExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              {isNodeExpanded ? (
                <FolderOpen className="w-4 h-4 text-[#4F8CFF] mr-2 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-[#4F8CFF] mr-2 shrink-0" />
              )}
            </>
          ) : (
            <FileCode className="w-4 h-4 text-[#757575] mr-2 ml-5 shrink-0" />
          )}

          <span className="text-xs truncate font-montserrat tracking-wide leading-none">
            {node.name}
          </span>
        </div>

        {/* Render Children */}
        {isFolder && isNodeExpanded && (
          <div className="flex flex-col">
            {children.map((child) => renderNode(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (rawNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#757575] px-4 font-montserrat">
        <span className="text-sm">No workspace analyzed</span>
      </div>
    );
  }

  return (
    <div
      ref={treeContainerRef}
      className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin border-r border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] w-64 shrink-0 flex flex-col"
    >
      <div className="px-3 mb-3 shrink-0">
        <h3 className="text-xs font-semibold text-white font-montserrat uppercase tracking-wider">
          Workspace Files
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">{renderNode("/", 0)}</div>
    </div>
  );
}
