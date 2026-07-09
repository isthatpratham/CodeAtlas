/**
 * layouts/index.ts
 *
 * Public API for the layout engine.
 * Callers use computeLayout(perspective, nodes, edges) and get
 * React Flow nodes + edges back — the same interface regardless of which
 * perspective is active.
 */

import { GraphNode, GraphEdge } from "@codeatlas/types";
import { Node as RfNode, Edge as RfEdge } from "@xyflow/react";
import { architectureLayout } from "./architecture";
import { dependencyLayout } from "./dependency";
import { radialLayout } from "./radial";

export type Perspective = "architecture" | "dependency" | "radial";

export const PERSPECTIVES: Array<{
  id: Perspective;
  label: string;
  description: string;
}> = [
  {
    id: "architecture",
    label: "Architecture",
    description: "Spatial folder structure — understand project organisation.",
  },
  {
    id: "dependency",
    label: "Dependency",
    description: "Flow-oriented layout — see what imports what.",
  },
  {
    id: "radial",
    label: "Radial",
    description: "Concentric rings — discover what is central to the codebase.",
  },
];

export function computeLayout(
  perspective: Perspective,
  nodes: GraphNode[],
  edges: GraphEdge[],
): { rfNodes: RfNode[]; rfEdges: RfEdge[] } {
  switch (perspective) {
    case "dependency":
      return dependencyLayout(nodes, edges);
    case "radial":
      return radialLayout(nodes, edges);
    case "architecture":
    default:
      return architectureLayout(nodes, edges);
  }
}

// Re-export individual layouts for direct use if needed
export { architectureLayout, dependencyLayout, radialLayout };
