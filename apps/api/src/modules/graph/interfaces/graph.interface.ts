import { RepositoryGraph, GraphNode, GraphEdge } from "@codeatlas/types";

export interface GraphBuilder {
  buildGraph(files: ParsedFile[]): Promise<RepositoryGraph>;
}

export interface LayoutEngine {
  calculateLayout(nodes: GraphNode[], edges: GraphEdge[]): Promise<GraphNode[]>;
}

export interface DependencyAnalyzer {
  analyzeDependencies(nodes: GraphNode[]): Promise<GraphEdge[]>;
}

export interface ParsedFile {
  path: string;
  name: string;
  imports: string[];
  exports: string[];
  size: number;
}
