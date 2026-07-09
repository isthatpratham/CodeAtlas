/**
 * layout.ts — legacy shim
 *
 * This file is kept for backwards compatibility.
 * All layout logic now lives in ./layouts/
 *
 * The store no longer imports from here directly — it imports
 * computeLayout from ./layouts. This shim ensures nothing else breaks.
 */

import { GraphNode, GraphEdge } from "@codeatlas/types";
import { Node as RfNode, Edge as RfEdge } from "@xyflow/react";
import { architectureLayout } from "./layouts/architecture";

/** @deprecated Import computeLayout from ./layouts instead. */
export function computeGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { rfNodes: RfNode[]; rfEdges: RfEdge[] } {
  return architectureLayout(nodes, edges);
}
