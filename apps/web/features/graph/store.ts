import { create } from "zustand";
import {
  Node as RfNode,
  Edge as RfEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import {
  Repository,
  RepositoryStatistics,
  GraphNode,
  GraphEdge,
} from "@codeatlas/types";
import { computeLayout, Perspective } from "./layouts";
import { trackEvent } from "../analytics/analytics";
import { API_URL } from "@codeatlas/config";

const PERSPECTIVE_STORAGE_KEY = "codeatlas:perspective";

function getStoredPerspective(): Perspective {
  if (typeof window === "undefined") return "architecture";
  const raw = window.localStorage.getItem(PERSPECTIVE_STORAGE_KEY);
  if (raw === "dependency" || raw === "radial" || raw === "architecture")
    return raw;
  return "architecture";
}

interface SearchResult {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
}

interface GraphState {
  repository: Repository | null;
  statistics: RepositoryStatistics | null;
  circularDependencies: string[][];
  externalPackages: string[];
  rawNodes: GraphNode[];
  rawEdges: GraphEdge[];
  nodes: RfNode[];
  edges: RfEdge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  edgeFilteringMode: "automatic" | "selected" | "hovered" | "all";
  searchQuery: string;
  searchResults: SearchResult[];
  loadingState:
    "idle" | "analyzing" | "loading-graph" | "rendering" | "ready" | "error";
  errorMessage: string | null;
  activePerspective: Perspective;

  analyzeRepository: (url: string) => Promise<void>;
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setEdgeFilteringMode: (
    mode: "automatic" | "selected" | "hovered" | "all",
  ) => void;
  setSearchQuery: (query: string) => void;
  setPerspective: (p: Perspective) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  reset: () => void;
}

// ── Consolidated Helper for Highlights & Visibility ──────────────────────────
function updateGraphVisuals(state: {
  nodes: RfNode[];
  edges: RfEdge[];
  rawNodes: GraphNode[];
  rawEdges: GraphEdge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activePerspective: Perspective;
  edgeFilteringMode: "automatic" | "selected" | "hovered" | "all";
  circularDependencies: string[][];
}): { nodes: RfNode[]; edges: RfEdge[] } {
  const {
    nodes,
    rawNodes,
    rawEdges,
    selectedNodeId,
    hoveredNodeId,
    activePerspective,
    edgeFilteringMode,
    circularDependencies,
  } = state;

  const hasSelection = !!selectedNodeId;
  const hasHover = !!hoveredNodeId;

  // Build connected node sets for selection and hover
  const selectedConnectedNodeIds = new Set<string>();
  const hoveredConnectedNodeIds = new Set<string>();

  // Find the root node ID
  const rootNode = nodes.find((n) => n.type === "root");
  const rootId = rootNode?.id;

  // Gather connections from rawEdges
  for (const edge of rawEdges) {
    if (edge.type === "import" || edge.type === "dependency") {
      if (edge.source === selectedNodeId)
        selectedConnectedNodeIds.add(edge.target);
      if (edge.target === selectedNodeId)
        selectedConnectedNodeIds.add(edge.source);
      if (edge.source === hoveredNodeId)
        hoveredConnectedNodeIds.add(edge.target);
      if (edge.target === hoveredNodeId)
        hoveredConnectedNodeIds.add(edge.source);
    }
  }

  // Helper to check if an edge is circular
  const isCircularEdge = (source: string, target: string): boolean => {
    return circularDependencies.some((cycle) => {
      for (let i = 0; i < cycle.length - 1; i++) {
        if (cycle[i] === source && cycle[i + 1] === target) {
          return true;
        }
      }
      return false;
    });
  };

  // 1. Recalculate Node Visual States
  const nextNodes = nodes.map((node) => {
    const isSelected = node.id === selectedNodeId;
    const isHovered = node.id === hoveredNodeId;

    let isHighlighted = false;
    let isFaded = false;

    if (hasHover) {
      if (isHovered || hoveredConnectedNodeIds.has(node.id)) {
        isHighlighted = true;
      } else {
        isFaded = true;
      }
    } else if (hasSelection) {
      if (isSelected || selectedConnectedNodeIds.has(node.id)) {
        isHighlighted = true;
      } else {
        isFaded = true;
      }
    }

    return {
      ...node,
      data: {
        ...node.data,
        isSelected,
        isHighlighted,
        isFaded,
      },
    };
  });

  // 2. Filter and Style Edges
  const nextEdges = rawEdges
    .map((edge) => {
      const isHierarchy = edge.type === "hierarchy";
      const isImport = edge.type === "import" || edge.type === "dependency";

      const isConnectedToSelected = !!(
        selectedNodeId &&
        (edge.source === selectedNodeId || edge.target === selectedNodeId)
      );
      const isConnectedToHovered = !!(
        hoveredNodeId &&
        (edge.source === hoveredNodeId || edge.target === hoveredNodeId)
      );

      let isVisible = true;

      if (edgeFilteringMode === "all") {
        isVisible = true;
      } else if (edgeFilteringMode === "selected") {
        isVisible = isConnectedToSelected;
      } else if (edgeFilteringMode === "hovered") {
        isVisible = isConnectedToHovered;
      } else {
        // edgeFilteringMode === "automatic"
        if (hasHover) {
          isVisible = isConnectedToHovered;
        } else if (hasSelection) {
          isVisible = isConnectedToSelected;
        } else {
          // Perspective defaults
          if (activePerspective === "architecture") {
            isVisible = isHierarchy;
          } else if (activePerspective === "dependency") {
            isVisible = isImport;
          } else if (activePerspective === "radial") {
            const sourceRawNode = rawNodes.find((n) => n.id === edge.source);
            const targetRawNode = rawNodes.find((n) => n.id === edge.target);

            const isSourceCore = !!(
              sourceRawNode?.metadata?.isEntryPoint ||
              (sourceRawNode?.metadata?.importanceScore !== undefined &&
                sourceRawNode.metadata.importanceScore > 0.4)
            );
            const isTargetCore = !!(
              targetRawNode?.metadata?.isEntryPoint ||
              (targetRawNode?.metadata?.importanceScore !== undefined &&
                targetRawNode.metadata.importanceScore > 0.4)
            );

            const isConnectedToRoot =
              edge.source === rootId || edge.target === rootId;

            isVisible = isConnectedToRoot || isSourceCore || isTargetCore;
          }
        }
      }

      if (!isVisible) return null;

      const isCircular = isCircularEdge(edge.source, edge.target);
      const isFaded =
        (hasHover && !isConnectedToHovered) ||
        (!hasHover && hasSelection && !isConnectedToSelected);

      const sourceRawNode = rawNodes.find((n) => n.id === edge.source);
      const targetRawNode = rawNodes.find((n) => n.id === edge.target);

      const isSourceCore = !!(
        sourceRawNode?.metadata?.isEntryPoint ||
        (sourceRawNode?.metadata?.importanceScore !== undefined &&
          sourceRawNode.metadata.importanceScore > 0.4)
      );
      const isTargetCore = !!(
        targetRawNode?.metadata?.isEntryPoint ||
        (targetRawNode?.metadata?.importanceScore !== undefined &&
          targetRawNode.metadata.importanceScore > 0.4)
      );

      const isPulseActive =
        isImport &&
        !isFaded &&
        (isConnectedToHovered ||
          isConnectedToSelected ||
          isSourceCore ||
          isTargetCore);

      const rfEdge: RfEdge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "custom",
        data: {
          edgeType: edge.type,
          isCircular,
          isPulseActive,
          isSelected: isConnectedToSelected,
          isHighlighted: isConnectedToHovered || isConnectedToSelected,
          isFaded,
        },
      };

      return rfEdge;
    })
    .filter((e): e is RfEdge => e !== null);

  return { nodes: nextNodes, edges: nextEdges };
}

export const useGraphStore = create<GraphState>((set, get) => ({
  repository: null,
  statistics: null,
  circularDependencies: [],
  externalPackages: [],
  rawNodes: [],
  rawEdges: [],
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  edgeFilteringMode: "automatic",
  searchQuery: "",
  searchResults: [],
  loadingState: "idle",
  errorMessage: null,
  activePerspective: "architecture",

  analyzeRepository: async (url: string) => {
    set({
      loadingState: "analyzing",
      errorMessage: null,
      selectedNodeId: null,
      hoveredNodeId: null,
      edgeFilteringMode: "automatic",
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_URL;
      const response = await fetch(`${baseUrl}/repositories/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: url }),
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg =
          result.error?.message || "Failed to analyze repository.";
        trackEvent("Error", "AnalysisFailed", errorMsg);
        set({ loadingState: "error", errorMessage: errorMsg });
        return;
      }

      set({ loadingState: "loading-graph" });

      const graphData = result.data;
      const perspective = getStoredPerspective();
      const { rfNodes, rfEdges } = computeLayout(
        perspective,
        graphData.nodes,
        graphData.edges,
      );

      trackEvent("Repository", "Analyze", url);

      const visuals = updateGraphVisuals({
        nodes: rfNodes,
        edges: rfEdges,
        rawNodes: graphData.nodes,
        rawEdges: graphData.edges,
        selectedNodeId: null,
        hoveredNodeId: null,
        activePerspective: perspective,
        edgeFilteringMode: "automatic",
        circularDependencies: graphData.analysis.circularDependencies || [],
      });

      set({
        repository: graphData.repository,
        statistics: graphData.statistics,
        circularDependencies: graphData.analysis.circularDependencies || [],
        externalPackages: graphData.analysis.externalPackages || [],
        rawNodes: graphData.nodes,
        rawEdges: graphData.edges,
        nodes: visuals.nodes,
        edges: visuals.edges,
        activePerspective: perspective,
        edgeFilteringMode: "automatic",
        hoveredNodeId: null,
        loadingState: "ready",
      });
    } catch {
      const errorMsg =
        "Network error. Please ensure the backend server is running on port 3001.";
      trackEvent("Error", "NetworkError", errorMsg);
      set({ loadingState: "error", errorMessage: errorMsg });
    }
  },

  setPerspective: (perspective: Perspective) => {
    const state = get();
    if (
      state.rawNodes.length === 0 ||
      perspective === state.activePerspective
    ) {
      return;
    }

    const { rfNodes, rfEdges } = computeLayout(
      perspective,
      state.rawNodes,
      state.rawEdges,
    );

    localStorage.setItem(PERSPECTIVE_STORAGE_KEY, perspective);
    trackEvent("Perspective", "Switch", perspective);

    const visuals = updateGraphVisuals({
      nodes: rfNodes,
      edges: rfEdges,
      rawNodes: state.rawNodes,
      rawEdges: state.rawEdges,
      selectedNodeId: state.selectedNodeId,
      hoveredNodeId: state.hoveredNodeId,
      activePerspective: perspective,
      edgeFilteringMode: state.edgeFilteringMode,
      circularDependencies: state.circularDependencies,
    });

    set({
      activePerspective: perspective,
      nodes: visuals.nodes,
      edges: visuals.edges,
    });
  },

  setSelectedNodeId: (id) => {
    const state = get();
    if (id) {
      trackEvent("Navigation", "SelectNode", id);
    } else {
      trackEvent("Navigation", "DeselectNode");
    }

    const visuals = updateGraphVisuals({
      nodes: state.nodes,
      edges: state.edges,
      rawNodes: state.rawNodes,
      rawEdges: state.rawEdges,
      selectedNodeId: id,
      hoveredNodeId: state.hoveredNodeId,
      activePerspective: state.activePerspective,
      edgeFilteringMode: state.edgeFilteringMode,
      circularDependencies: state.circularDependencies,
    });

    set({
      selectedNodeId: id,
      nodes: visuals.nodes,
      edges: visuals.edges,
    });
  },

  setHoveredNodeId: (id) => {
    const state = get();
    const visuals = updateGraphVisuals({
      nodes: state.nodes,
      edges: state.edges,
      rawNodes: state.rawNodes,
      rawEdges: state.rawEdges,
      selectedNodeId: state.selectedNodeId,
      hoveredNodeId: id,
      activePerspective: state.activePerspective,
      edgeFilteringMode: state.edgeFilteringMode,
      circularDependencies: state.circularDependencies,
    });

    set({
      hoveredNodeId: id,
      nodes: visuals.nodes,
      edges: visuals.edges,
    });
  },

  setEdgeFilteringMode: (mode) => {
    const state = get();
    const visuals = updateGraphVisuals({
      nodes: state.nodes,
      edges: state.edges,
      rawNodes: state.rawNodes,
      rawEdges: state.rawEdges,
      selectedNodeId: state.selectedNodeId,
      hoveredNodeId: state.hoveredNodeId,
      activePerspective: state.activePerspective,
      edgeFilteringMode: mode,
      circularDependencies: state.circularDependencies,
    });

    set({
      edgeFilteringMode: mode,
      nodes: visuals.nodes,
      edges: visuals.edges,
    });
  },

  setSearchQuery: (query) => {
    set((state) => {
      if (!query.trim()) return { searchQuery: "", searchResults: [] };
      const lower = query.toLowerCase();
      trackEvent("Search", "Query", query);
      const results = state.rawNodes
        .filter(
          (node) =>
            node.type !== "root" && node.name.toLowerCase().includes(lower),
        )
        .slice(0, 10)
        .map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type as "folder" | "file",
          path: node.path,
        }));
      return { searchQuery: query, searchResults: results };
    });
  },

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  reset: () => {
    set({
      repository: null,
      statistics: null,
      circularDependencies: [],
      externalPackages: [],
      rawNodes: [],
      rawEdges: [],
      nodes: [],
      edges: [],
      selectedNodeId: null,
      hoveredNodeId: null,
      edgeFilteringMode: "automatic",
      searchQuery: "",
      searchResults: [],
      loadingState: "idle",
      errorMessage: null,
    });
  },
}));
