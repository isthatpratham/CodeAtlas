"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useGraphStore } from "../store";
import { GraphNode } from "@codeatlas/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 280;
const STORAGE_KEY = "codeatlas:sidebar-width";

function getStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_WIDTH;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n)) : DEFAULT_WIDTH;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SidebarTree() {
  const { rawNodes, selectedNodeId, setSelectedNodeId } = useGraphStore();

  // ── Resizable width ──────────────────────────────────────────────────────
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(DEFAULT_WIDTH);
  const isDragging = useRef<boolean>(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setWidth(getStoredWidth());
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragStartWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
      setWidth(next);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Persist
      setWidth((prev) => {
        localStorage.setItem(STORAGE_KEY, String(prev));
        return prev;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── Tree data ────────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "/": true });

  const parentToChildren = new Map<string, GraphNode[]>();
  const nodesMap = new Map<string, GraphNode>();

  for (const node of rawNodes) {
    nodesMap.set(node.id, node);
    if (node.type !== "root") {
      const pid = node.parentId || "/";
      if (!parentToChildren.has(pid)) parentToChildren.set(pid, []);
      parentToChildren.get(pid)!.push(node);
    }
  }

  for (const list of parentToChildren.values()) {
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNodeClick = (id: string) => setSelectedNodeId(id);

  // Auto-scroll selected node into view
  useEffect(() => {
    if (selectedNodeId) {
      const el = document.getElementById(`tree-node-${selectedNodeId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedNodeId]);

  // ── Render tree ──────────────────────────────────────────────────────────
  const renderNode = (nodeId: string, depth: number): React.ReactNode => {
    const node = nodesMap.get(nodeId);
    if (!node) return null;

    const isFolder = node.type === "folder" || node.type === "root";
    const isExpanded = expanded[nodeId];
    const isSelected = selectedNodeId === nodeId;
    const children = parentToChildren.get(nodeId) || [];

    return (
      <div key={nodeId} className="select-none">
        <div
          id={`tree-node-${nodeId}`}
          onClick={() => handleNodeClick(nodeId)}
          className={`flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors duration-100 group ${
            isSelected
              ? "bg-[#4F8CFF]/12 text-[#4F8CFF]"
              : "text-[#888888] hover:bg-white/[0.04] hover:text-white"
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isFolder ? (
            <>
              <button
                onClick={(e) => toggleExpand(nodeId, e)}
                className="p-0.5 rounded mr-1 text-[#555555] group-hover:text-[#888888] shrink-0 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-[#4F8CFF] mr-2 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-[#4F8CFF] mr-2 shrink-0" />
              )}
            </>
          ) : (
            <FileCode className="w-3.5 h-3.5 text-[#555555] mr-2 ml-5 shrink-0" />
          )}

          <span className="text-xs truncate leading-none">{node.name}</span>
        </div>

        {isFolder && isExpanded && (
          <div>
            {children.map((child) => renderNode(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (rawNodes.length === 0) {
    return (
      <div
        style={{ width }}
        className="shrink-0 flex flex-col items-center justify-center h-full text-center text-[#555555] px-4 border-r border-white/[0.07] bg-[#0A0A0A]"
      >
        <span className="text-xs">No workspace analyzed</span>
      </div>
    );
  }

  return (
    <div className="flex h-full shrink-0 relative" style={{ width }}>
      {/* Scrollable tree content */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.07] bg-[#0A0A0A]">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <h3 className="text-[10px] font-semibold text-[#555555] uppercase tracking-[0.15em]">
            Files
          </h3>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-px">
          {renderNode("/", 0)}
        </div>
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleDragStart}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-20 group"
        title="Drag to resize"
      >
        {/* Invisible wider hit target */}
        <div className="absolute inset-y-0 -left-1 -right-1" />
        {/* Visible indicator on hover */}
        <div className="absolute inset-y-0 right-0 w-px bg-white/[0.07] group-hover:bg-[#4F8CFF]/40 transition-colors duration-150" />
      </div>
    </div>
  );
}
