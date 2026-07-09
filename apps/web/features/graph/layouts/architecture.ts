/**
 * layouts/architecture.ts
 *
 * The Architecture perspective: nested spatial layout using the folder
 * hierarchy exactly as it exists on disk. This is the original layout
 * algorithm, preserved here as a named export.
 */

import { GraphNode, GraphEdge } from "@codeatlas/types";
import { Node as RfNode, Edge as RfEdge } from "@xyflow/react";
import { buildEdges } from "./shared";

export function architectureLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { rfNodes: RfNode[]; rfEdges: RfEdge[] } {
  const parentToChildren = new Map<string, string[]>();
  const nodesMap = new Map<string, GraphNode>();

  for (const node of nodes) {
    nodesMap.set(node.id, node);
    if (node.type !== "root") {
      const pid = node.parentId || "/";
      if (!parentToChildren.has(pid)) parentToChildren.set(pid, []);
      parentToChildren.get(pid)!.push(node.id);
    }
  }

  const positions = new Map<string, { x: number; y: number }>();
  const sizes = new Map<string, { width: number; height: number }>();

  const computeSize = (nodeId: string): { width: number; height: number } => {
    const node = nodesMap.get(nodeId);
    if (!node) return { width: 0, height: 0 };

    if (node.type === "file") {
      const size = { width: 220, height: 64 };
      sizes.set(nodeId, size);
      return size;
    }

    const childrenIds = parentToChildren.get(nodeId) || [];
    if (childrenIds.length === 0) {
      const size = { width: 220, height: 100 };
      sizes.set(nodeId, size);
      return size;
    }

    const folderNodes = childrenIds.filter(
      (cid) => nodesMap.get(cid)?.type !== "file",
    );
    const fileNodes = childrenIds.filter(
      (cid) => nodesMap.get(cid)?.type === "file",
    );

    let yOffset = 60;
    let maxFolderWidth = 0;
    let folderY = yOffset;

    for (const fid of folderNodes) {
      const fSize = computeSize(fid);
      positions.set(fid, { x: 30, y: folderY });
      folderY += fSize.height + 30;
      maxFolderWidth = Math.max(maxFolderWidth, fSize.width + 60);
    }

    let fileX = 30;
    let fileY = folderY;
    let colIndex = 0;
    let maxFilesRowWidth = 0;
    const fileCols = 3;

    for (const fid of fileNodes) {
      computeSize(fid);
      positions.set(fid, { x: fileX, y: fileY });
      colIndex++;
      if (colIndex < fileCols) {
        fileX += 250;
      } else {
        maxFilesRowWidth = Math.max(maxFilesRowWidth, fileX + 220);
        fileX = 30;
        fileY += 94;
        colIndex = 0;
      }
    }

    if (colIndex > 0) {
      maxFilesRowWidth = Math.max(maxFilesRowWidth, fileX + 220);
      fileY += 94;
    }

    const calculatedWidth = Math.max(maxFolderWidth, maxFilesRowWidth, 260);
    const calculatedHeight = Math.max(fileY, folderY, 120);

    const folderSize = { width: calculatedWidth, height: calculatedHeight };
    sizes.set(nodeId, folderSize);
    return folderSize;
  };

  computeSize("/");

  const rfNodes: RfNode[] = nodes.map((node) => {
    const size = sizes.get(node.id) || { width: 100, height: 100 };
    const pos = positions.get(node.id) || { x: 0, y: 0 };

    const rfNode: RfNode = {
      id: node.id,
      type: node.type,
      position: node.type === "root" ? { x: 0, y: 0 } : pos,
      data: {
        label: node.name,
        name: node.name,
        type: node.type,
        path: node.path,
        metadata: node.metadata,
        children: node.children,
      },
      style: { width: size.width, height: size.height },
    };

    if (node.parentId && node.type !== "root") {
      rfNode.parentId = node.parentId === "/" ? undefined : node.parentId;
    }

    return rfNode;
  });

  return { rfNodes, rfEdges: buildEdges(edges) };
}
