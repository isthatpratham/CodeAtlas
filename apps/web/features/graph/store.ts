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
import { computeGraphLayout } from "./layout";
import { trackEvent } from "../analytics/analytics";

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
  searchQuery: string;
  searchResults: SearchResult[];
  loadingState:
    "idle" | "analyzing" | "loading-graph" | "rendering" | "ready" | "error";
  errorMessage: string | null;

  analyzeRepository: (url: string) => Promise<void>;
  setSelectedNodeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  reset: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  repository: null,
  statistics: null,
  circularDependencies: [],
  externalPackages: [],
  rawNodes: [],
  rawEdges: [],
  nodes: [],
  edges: [],
  selectedNodeId: null,
  searchQuery: "",
  searchResults: [],
  loadingState: "idle",
  errorMessage: null,

  analyzeRepository: async (url: string) => {
    set({
      loadingState: "analyzing",
      errorMessage: null,
      selectedNodeId: null,
    });

    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/repositories/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryUrl: url }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.error?.message || "Failed to analyze repository.";
        trackEvent("Error", "AnalysisFailed", errorMsg);
        set({
          loadingState: "error",
          errorMessage: errorMsg,
        });
        return;
      }

      set({ loadingState: "loading-graph" });

      const graphData = result.data;
      const { rfNodes, rfEdges } = computeGraphLayout(
        graphData.nodes,
        graphData.edges
      );

      trackEvent("Repository", "Analyze", url);

      set({
        repository: graphData.repository,
        statistics: graphData.statistics,
        circularDependencies: graphData.analysis.circularDependencies || [],
        externalPackages: graphData.analysis.externalPackages || [],
        rawNodes: graphData.nodes,
        rawEdges: graphData.edges,
        nodes: rfNodes,
        edges: rfEdges,
        loadingState: "ready",
      });
    } catch (error) {
      const errorMsg = "Network error. Please ensure the backend server is running on port 3001.";
      trackEvent("Error", "NetworkError", errorMsg);
      set({
        loadingState: "error",
        errorMessage: errorMsg,
      });
    }
  },

  setSelectedNodeId: (id) => {
    set((state) => {
      const nextNodes = state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === id,
          isHighlighted: false,
          isFaded: false,
        },
      }));

      const nextEdges = state.edges.map((edge) => ({
        ...edge,
        animated: edge.type === "default" && edge.source === id,
        style: {
          ...edge.style,
          stroke: edge.id.startsWith("hierarchy-")
            ? "rgba(255, 255, 255, 0.05)"
            : "#4F8CFF",
          opacity: 1.0,
        },
      }));

      if (!id) {
        trackEvent("Navigation", "DeselectNode");
        return { selectedNodeId: null, nodes: nextNodes, edges: nextEdges };
      }

      trackEvent("Navigation", "SelectNode", id);

      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(id);

      const activeEdgeIds = new Set<string>();

      for (const edge of state.edges) {
        if (edge.source === id || edge.target === id) {
          connectedNodeIds.add(edge.source);
          connectedNodeIds.add(edge.target);
          activeEdgeIds.add(edge.id);
        }
      }

      const highlightedNodes = nextNodes.map((node) => {
        const isSelected = node.id === id;
        const isConnected = connectedNodeIds.has(node.id);

        let isFaded = false;
        let isHighlighted = false;

        if (node.type === "file") {
          if (!isConnected) {
            isFaded = true;
          } else if (!isSelected) {
            isHighlighted = true;
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

      const highlightedEdges = nextEdges.map((edge) => {
        const isActive = activeEdgeIds.has(edge.id);
        const isHierarchy = edge.id.startsWith("hierarchy-");

        if (isHierarchy) {
          return {
            ...edge,
            style: {
              ...edge.style,
              opacity: isActive ? 0.3 : 0.05,
            },
          };
        }

        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: isActive ? "#3DDC84" : "#4F8CFF",
            opacity: isActive ? 1.0 : 0.15,
          },
        };
      });

      return {
        selectedNodeId: id,
        nodes: highlightedNodes,
        edges: highlightedEdges,
      };
    });
  },

  setSearchQuery: (query) => {
    set((state) => {
      if (!query.trim()) {
        return { searchQuery: "", searchResults: [] };
      }

      const lower = query.toLowerCase();
      trackEvent("Search", "Query", query);
      const results = state.rawNodes
        .filter(
          (node) =>
            node.type !== "root" && node.name.toLowerCase().includes(lower)
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
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
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
      searchQuery: "",
      searchResults: [],
      loadingState: "idle",
      errorMessage: null,
    });
  },
}));
