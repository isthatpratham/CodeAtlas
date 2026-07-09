export interface RepositoryGraph {
  version: string;
  repository: Repository;
  statistics: RepositoryStatistics;
  layout: LayoutMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
  analysis: AnalysisMetadata;
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  branch: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  stars: number;
  forks: number;
}

export interface RepositoryStatistics {
  totalNodes: number;
  totalEdges: number;
  totalFolders: number;
  totalFiles: number;
  totalImports: number;
  maxDepth: number;
  largestFolder: string;
  languages: LanguageStatistic[];
  repositorySize: number;
}

export interface LanguageStatistic {
  name: string;
  files: number;
  percentage: number;
}

export interface LayoutMetadata {
  algorithm: string;
  generatedAt: string;
  nodeSpacing: number;
  layerSpacing: number;
  zoomLevel: number;
}

export interface GraphNode {
  id: string;
  type: "root" | "folder" | "file";
  name: string;
  path: string;
  parentId?: string;
  children: string[];
  metadata: NodeMetadata;
  layout: NodeLayout;
}

export interface NodeMetadata {
  extension?: string;
  language?: string;
  size: number;
  depth: number;
  imports: number;
  importedBy: number;
  isEntryPoint: boolean;
  isExternal: boolean;
  semanticType?: string;
  importanceScore?: number;
  dependencyScore?: number;
  relationshipDensity?: number;
  isLeaf?: boolean;
}

export interface NodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
}

export type EdgeType = "hierarchy" | "import" | "export" | "dependency";

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  direction: "forward";
  metadata?: EdgeMetadata;
}

export interface EdgeMetadata {
  weight: number;
  label?: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  selectedNode?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  score: number;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  duration: number;
  parserVersion: string;
  supportedLanguages: string[];
  warnings: string[];
  circularDependencies?: string[][];
  externalPackages?: string[];
}

export interface RepositoryResponse {
  success: boolean;
  data: RepositoryGraph;
}
