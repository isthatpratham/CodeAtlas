/**
 * layouts/radial.ts
 *
 * The Radial perspective: concentric rings centred on the repository root.
 *
 * Algorithm:
 *   1. Score every file by importanceScore + importedBy (higher = more central).
 *   2. Bin files into rings 0…4 (ring 0 is innermost, ring 4 outermost).
 *   3. Distribute files in each ring evenly on a circle of radius R_ring.
 *   4. Folders occupy ring 0 alongside the most important files.
 *   5. The root node sits at the exact centre (0, 0).
 *
 * This layout answers "What is central to this codebase?" — the closer
 * to the origin, the more foundational the module.
 */

import { GraphNode, GraphEdge } from "@codeatlas/types";
import { Node as RfNode, Edge as RfEdge } from "@xyflow/react";
import { buildEdges, makeNodeData } from "./shared";

const NODE_W = 180;
const NODE_H = 50;

// Ring radii in pixels — generous spacing prevents overlap
const RING_RADII = [0, 380, 720, 1080, 1440];

function radialScore(node: GraphNode): number {
  return (
    (node.metadata.importanceScore || 0) * 10 +
    (node.metadata.importedBy || 0) * 2 +
    (node.metadata.imports || 0)
  );
}

export function radialLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { rfNodes: RfNode[]; rfEdges: RfEdge[] } {
  const rootNode = nodes.find((n) => n.type === "root");
  const fileNodes = nodes.filter((n) => n.type === "file");
  const folderNodes = nodes.filter((n) => n.type === "folder");

  // Score files descending
  const scored = fileNodes
    .map((n) => ({ node: n, score: radialScore(n) }))
    .sort((a, b) => b.score - a.score);

  const total = scored.length;
  // Ring 0 gets the top 5%, rings 1-4 divide the rest
  const ring0Count = Math.max(0, Math.ceil(total * 0.05));
  const perRing = Math.ceil((total - ring0Count) / 4);

  const ringAssignment: Array<{ node: GraphNode; ring: number }> = scored.map(
    ({ node }, i) => {
      if (i < ring0Count) return { node, ring: 1 }; // innermost file ring
      const ring = Math.min(4, 1 + Math.ceil((i - ring0Count + 1) / perRing));
      return { node, ring };
    },
  );

  // Group by ring
  const rings: Map<number, GraphNode[]> = new Map();
  for (const { node, ring } of ringAssignment) {
    if (!rings.has(ring)) rings.set(ring, []);
    rings.get(ring)!.push(node);
  }

  // Folders sit in ring 1 alongside high-importance files
  const folderRingNodes = folderNodes;

  const positions = new Map<string, { x: number; y: number }>();

  // Root at centre
  if (rootNode) {
    positions.set(rootNode.id, { x: 0, y: 0 });
  }

  // Place folders evenly on a small inner ring (radius 200)
  const folderRadius = 220;
  folderNodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(folderNodes.length, 1) - Math.PI / 2;
    positions.set(n.id, {
      x: Math.cos(angle) * folderRadius,
      y: Math.sin(angle) * folderRadius,
    });
  });

  // Place file rings
  for (const [ring, ringNodes] of rings.entries()) {
    const radius = RING_RADII[ring] || ring * 360;
    const count = ringNodes.length;

    // Spread evenly; start at top (−π/2)
    ringNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      positions.set(node.id, {
        x: Math.cos(angle) * radius - NODE_W / 2,
        y: Math.sin(angle) * radius - NODE_H / 2,
      });
    });
  }

  // Keep a reference so TS is happy
  void folderRingNodes;

  const rfNodes: RfNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: makeNodeData(node),
    style: {
      width: node.type === "root" ? 160 : NODE_W,
      height: node.type === "root" ? 60 : NODE_H,
    },
  }));

  // Radial shows all import edges
  const importEdges = edges.filter((e) => e.type === "import");
  return { rfNodes, rfEdges: buildEdges(importEdges) };
}
