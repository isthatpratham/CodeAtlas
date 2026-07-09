"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGraphStore } from "../store";
import { RootNode, FolderNode, FileNode } from "./custom-nodes";
import { CodeAtlasEdge } from "./CodeAtlasEdge";
import { Maximize, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const nodeTypes = {
  root: RootNode,
  folder: FolderNode,
  file: FileNode,
};

const edgeTypes = {
  custom: CodeAtlasEdge,
};

const PERSPECTIVE_STORAGE_KEY = "codeatlas:perspective";

export function GraphCanvas() {
  const {
    nodes,
    edges,
    selectedNodeId,
    activePerspective,
    setPerspective,
    setSelectedNodeId,
    setHoveredNodeId,
    onNodesChange,
    onEdgesChange,
    repository,
  } = useGraphStore();

  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

  // ── Hydrate persisted perspective on first mount ─────────────────────────
  // The store initialises with "architecture" but we immediately correct it
  // to whatever is in localStorage without triggering a network request.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const stored = localStorage.getItem(PERSPECTIVE_STORAGE_KEY);
    if (
      stored &&
      stored !== "architecture" &&
      (stored === "dependency" || stored === "radial")
    ) {
      // Only switch if a repository is already loaded (e.g. hot reload)
      if (repository) {
        setPerspective(stored as "dependency" | "radial");
      }
    }
  }, [repository, setPerspective]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(node.id);
    },
    [setHoveredNodeId],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);

  // ── Fit view on initial repository load ──────────────────────────────────
  useEffect(() => {
    if (repository && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.15, duration: 900 });
      }, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, fitView]);

  // ── Fit view when perspective changes ────────────────────────────────────
  // Triggered by activePerspective — gives a smooth re-frame after the
  // node positions update.
  const prevPerspectiveRef = useRef(activePerspective);
  useEffect(() => {
    if (activePerspective !== prevPerspectiveRef.current) {
      prevPerspectiveRef.current = activePerspective;
      setTimeout(() => {
        fitView({ padding: 0.18, duration: 750 });
      }, 80);
    }
  }, [activePerspective, fitView]);

  const handleReset = () => {
    setViewport({ x: 0, y: 0, zoom: 1.0 }, { duration: 800 });
  };

  const handleFit = () => {
    fitView({ padding: 0.15, duration: 800 });
  };

  // Node coloring for MiniMap — reflects active perspective
  const getMiniMapNodeColor = (node: Node) => {
    if (node.id === selectedNodeId) return "#4F8CFF";
    switch (node.type) {
      case "root":
        return "#4F8CFF";
      case "folder":
        return "rgba(255,255,255,0.06)";
      case "file":
        return "#3DDC84";
      default:
        return "#1B1B1B";
    }
  };

  return (
    <div className="flex-1 h-full relative bg-[#0A0A0A]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        minZoom={0.04}
        maxZoom={3.0}
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1e1e1e"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />

        <MiniMap
          zoomable
          pannable
          nodeColor={getMiniMapNodeColor}
          style={{
            background: "#0D0D0D",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
          }}
          maskColor="rgba(0,0,0,0.55)"
        />

        {/* Zoom / Camera toolbar */}
        <div className="absolute left-4 top-4 flex flex-col bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.6)] z-10 overflow-hidden divide-y divide-[rgba(255,255,255,0.05)]">
          <button
            onClick={() => zoomIn({ duration: 250 })}
            title="Zoom In"
            className="p-2 text-[#757575] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomOut({ duration: 250 })}
            title="Zoom Out"
            className="p-2 text-[#757575] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            title="Fit to Screen"
            className="p-2 text-[#757575] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Camera"
            className="p-2 text-[#757575] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </ReactFlow>
    </div>
  );
}
