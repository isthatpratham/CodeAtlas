/**
 * layouts/dependency.ts
 *
 * The Dependency perspective: force-directed-style layout that clusters
 * files by their import relationships.
 *
 * Algorithm: Layered "importance bucket" layout.
 *   1. Score every file by (imports + importedBy × 1.5 + importanceScore × 10).
 *   2. Bin files into 5 layers of importance.
 *   3. Place each layer in concentric horizontal bands.
 *   4. Within each band, arrange files in columns separated by 320px.
 *   5. Folder/root nodes are placed at the center top.
 *
 * This makes highly-connected files rise to the top and leaf files
 * fall to the bottom — visually answering "what depends on what?"
 */

import { GraphNode, GraphEdge } from "@codeatlas/types";
import { Node as RfNode, Edge as RfEdge } from "@xyflow/react";
import { buildEdges, makeNodeData } from "./shared";

const NODE_W = 200;
const NODE_H = 56;
const COL_GAP = 340;
const ROW_GAP = 130;
const LAYER_COUNT = 5;

function dependencyScore(node: GraphNode): number {
  const m = node.metadata;
  return (
    (m.imports || 0) +
    (m.importedBy || 0) * 1.5 +
    (m.importanceScore || 0) * 10
  );
}

export function dependencyLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { rfNodes: RfNode[]; rfEdges: RfEdge[] } {
  const fileNodes = nodes.filter((n) => n.type === "file");
  const nonFileNodes = nodes.filter((n) => n.type !== "file");

  // Score and sort descending — most connected first
  const scored = fileNodes
    .map((n) => ({ node: n, score: dependencyScore(n) }))
    .sort((a, b) => b.score - a.score);

  const total = scored.length;
  const layerSizes: number[] = [];
  const baseSize = Math.ceil(total / LAYER_COUNT);
  let remaining = total;
  for (let i = 0; i < LAYER_COUNT; i++) {
    const size = Math.min(remaining, i === 0 ? Math.ceil(baseSize * 0.5) : baseSize);
    layerSizes.push(size);
    remaining -= size;
  }

  const positions = new Map<string, { x: number; y: number }>();

  let idx = 0;
  let currentY = 160; // first layer starts below folder row

  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    const count = layerSizes[layer];
    if (count === 0) continue;

    // Centre the columns for each layer
    const totalLayerWidth = count * COL_GAP - (COL_GAP - NODE_W);
    const startX = -(totalLayerWidth / 2);

    for (let col = 0; col < count; col++) {
      const { node } = scored[idx++];
      positions.set(node.id, {
        x: startX + col * COL_GAP,
        y: currentY,
      });
    }
    currentY += ROW_GAP;
  }

  // Place root and folder nodes in a header row at the top
  const folderCount = nonFileNodes.length;
  const folderStartX = -(folderCount * 260) / 2;
  nonFileNodes.forEach((n, i) => {
    positions.set(n.id, {
      x: folderStartX + i * 260,
      y: 0,
    });
  });

  const rfNodes: RfNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    // Flat layout — no parentId nesting
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: makeNodeData(node),
    style: { width: NODE_W, height: node.type === "file" ? NODE_H : 72 },
  }));

  // Dependency perspective shows only import edges (no hierarchy clutter)
  const importEdges = edges.filter((e) => e.type === "import" || e.type === "dependency");
  return { rfNodes, rfEdges: buildEdges(importEdges) };
}
