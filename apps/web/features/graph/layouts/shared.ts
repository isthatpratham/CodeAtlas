/**
 * layouts/shared.ts
 *
 * Shared utilities for all layout algorithms.
 * The edge builder is the same for every perspective — only node
 * positions differ between layouts.
 */

import { GraphEdge } from "@codeatlas/types";
import { Edge as RfEdge } from "@xyflow/react";

export function buildEdges(edges: GraphEdge[]): RfEdge[] {
  return edges.map((edge) => {
    const rfEdge: RfEdge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "custom",
      data: {
        edgeType: edge.type,
      },
    };
    return rfEdge;
  });
}

/** Standard node data shape used by all perspectives. */
export function makeNodeData(node: import("@codeatlas/types").GraphNode) {
  return {
    label: node.name,
    name: node.name,
    type: node.type,
    path: node.path,
    metadata: node.metadata,
    children: node.children,
  };
}
