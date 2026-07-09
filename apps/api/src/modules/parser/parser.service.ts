import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import * as ts from "typescript";
import {
  GraphNode,
  GraphEdge,
  NodeMetadata,
  NodeLayout,
  RepositoryStatistics,
} from "@codeatlas/types";

const IGNORED_FOLDERS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  "vendor",
]);

const BINARY_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "tiff",
  "bmp",
  "svg",
  "mp4",
  "mkv",
  "avi",
  "mov",
  "flv",
  "mp3",
  "wav",
  "flac",
  "ogg",
  "aac",
  "zip",
  "rar",
  "tar",
  "gz",
  "7z",
  "bz2",
  "xz",
  "exe",
  "dll",
  "so",
  "dylib",
  "class",
  "jar",
  "bin",
  "o",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
]);

const LANGUAGE_MAP: Record<string, string> = {
  ts: "TypeScript",
  js: "JavaScript",
  tsx: "TSX",
  jsx: "JSX",
  json: "JSON",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  md: "Markdown",
  yaml: "YAML",
  yml: "YAML",
};

const ENTRY_POINT_FILES = new Set([
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "main.ts",
  "main.tsx",
  "main.js",
  "main.jsx",
  "app.ts",
  "app.tsx",
  "app.js",
  "app.jsx",
  "server.ts",
  "server.js",
]);

@Injectable()
export class ParserService {
  async scan(clonedDir: string): Promise<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    statistics: RepositoryStatistics;
    circularDependencies: string[][];
    externalPackages: string[];
  }> {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const rootName = path.basename(clonedDir);

    const pathMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();
    const fileIds = new Set<string>();

    const defaultLayout = (width = 0, height = 0): NodeLayout => ({
      x: 0,
      y: 0,
      width,
      height,
      collapsed: false,
    });

    const defaultMetadata = (size = 0, depth = 0): NodeMetadata => ({
      size,
      depth,
      imports: 0,
      importedBy: 0,
      isEntryPoint: false,
      isExternal: false,
    });

    // Create root node
    const rootId = "/";
    pathMap.set(clonedDir, rootId);
    childrenMap.set(rootId, []);

    const rootNode: GraphNode = {
      id: rootId,
      type: "root",
      name: rootName,
      path: "",
      children: [],
      metadata: defaultMetadata(0, 0),
      layout: defaultLayout(100, 100),
    };
    nodes.push(rootNode);

    // 1. Recursive scan to build directory structure and find files
    const traverse = async (
      currentDir: string,
      currentDepth: number,
      parentId: string,
    ) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(currentDir, entry.name);
        const relPath = path.relative(clonedDir, entryPath).replace(/\\/g, "/");
        const nodeId = `/${relPath}`;

        // Ignore hidden system files/folders (starting with dot)
        if (entry.name.startsWith(".")) {
          continue;
        }

        if (entry.isDirectory()) {
          if (IGNORED_FOLDERS.has(entry.name)) {
            continue;
          }

          pathMap.set(entryPath, nodeId);
          childrenMap.set(nodeId, []);

          const folderNode: GraphNode = {
            id: nodeId,
            type: "folder",
            name: entry.name,
            path: relPath,
            parentId,
            children: [],
            metadata: defaultMetadata(0, currentDepth + 1),
            layout: defaultLayout(80, 80),
          };
          nodes.push(folderNode);
          childrenMap.get(parentId)?.push(nodeId);

          await traverse(entryPath, currentDepth + 1, nodeId);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).slice(1).toLowerCase();

          // Ignore binary files
          if (BINARY_EXTENSIONS.has(ext)) {
            continue;
          }

          try {
            const stats = await fs.stat(entryPath);
            const size = stats.size;
            const language = LANGUAGE_MAP[ext] || "Unknown";
            const isEntryPoint = ENTRY_POINT_FILES.has(
              entry.name.toLowerCase(),
            );

            const fileNode: GraphNode = {
              id: nodeId,
              type: "file",
              name: entry.name,
              path: relPath,
              parentId,
              children: [],
              metadata: {
                ...defaultMetadata(size, currentDepth + 1),
                extension: ext,
                language,
                isEntryPoint,
              },
              layout: defaultLayout(40, 40),
            };
            nodes.push(fileNode);
            fileIds.add(nodeId);
            childrenMap.get(parentId)?.push(nodeId);
          } catch {
            continue;
          }
        }
      }
    };

    await traverse(clonedDir, 0, rootId);

    // Apply children maps
    for (const node of nodes) {
      if (node.type === "root" || node.type === "folder") {
        node.children = childrenMap.get(node.id) || [];
      }
    }

    // 2. Parse AST for imports and exports
    const rawImportsMap = new Map<string, string[]>();
    const nodeExportsMap = new Map<string, string[]>();
    const nodeExternalMap = new Map<string, string[]>();
    const globalExternalPackages = new Set<string>();

    for (const node of nodes) {
      if (node.type === "file") {
        const ext = node.metadata.extension || "";
        const isSourceFile = ["ts", "tsx", "js", "jsx"].includes(ext);

        if (isSourceFile) {
          const absPath = path.join(clonedDir, node.path);
          try {
            const content = await fs.readFile(absPath, "utf-8");
            const parsed = this.parseFileImportsAndExports(absPath, content);

            rawImportsMap.set(node.id, parsed.imports);
            nodeExportsMap.set(node.id, parsed.exports);
            nodeExternalMap.set(node.id, parsed.external);

            for (const pkg of parsed.external) {
              globalExternalPackages.add(pkg);
            }
          } catch (err) {
            console.warn(
              `Failed to read source file content for AST parse: ${node.path}`,
              err,
            );
          }
        }
      }
    }

    // 3. Resolve Import Paths and Build Edges
    const fileImportsCount = new Map<string, number>();
    const fileImportedByCount = new Map<string, number>();
    const folderImportEdges = new Set<string>(); // Keep track of unique folder edges to prevent duplication

    // Initialize counts
    for (const node of nodes) {
      if (node.type === "file") {
        fileImportsCount.set(node.id, 0);
        fileImportedByCount.set(node.id, 0);
      }
    }

    for (const [sourceId, imports] of rawImportsMap.entries()) {
      for (const specifier of imports) {
        const resolvedId = this.resolveImportPath(sourceId, specifier, fileIds);

        if (resolvedId && resolvedId !== sourceId) {
          // File-to-file edge
          edges.push({
            id: `edge-${sourceId}-${resolvedId}`,
            source: sourceId,
            target: resolvedId,
            type: "import",
            direction: "forward",
            metadata: { weight: 1 },
          });

          fileImportsCount.set(
            sourceId,
            (fileImportsCount.get(sourceId) || 0) + 1,
          );
          fileImportedByCount.set(
            resolvedId,
            (fileImportedByCount.get(resolvedId) || 0) + 1,
          );

          // Folder-to-folder edge aggregation
          const sourceNode = nodes.find((n) => n.id === sourceId);
          const targetNode = nodes.find((n) => n.id === resolvedId);

          if (
            sourceNode?.parentId &&
            targetNode?.parentId &&
            sourceNode.parentId !== targetNode.parentId
          ) {
            const folderEdgeKey = `folder-${sourceNode.parentId}-${targetNode.parentId}`;
            if (!folderImportEdges.has(folderEdgeKey)) {
              folderImportEdges.add(folderEdgeKey);
              edges.push({
                id: folderEdgeKey,
                source: sourceNode.parentId,
                target: targetNode.parentId,
                type: "dependency",
                direction: "forward",
                metadata: { weight: 1 },
              });
            }
          }
        }
      }
    }

    // Add folder hierarchy edges
    for (const node of nodes) {
      if (node.parentId) {
        edges.push({
          id: `hierarchy-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: "hierarchy",
          direction: "forward",
          metadata: { weight: 1 },
        });
      }
    }

    // 4. Calculate Folder Sizes Recursively
    const folderSizes = new Map<string, number>();
    const getFolderSize = (nodeId: string): number => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return 0;
      if (node.type === "file") {
        return node.metadata.size;
      }

      let size = 0;
      for (const childId of node.children) {
        size += getFolderSize(childId);
      }
      folderSizes.set(nodeId, size);
      node.metadata.size = size;
      return size;
    };

    getFolderSize(rootId);

    // 5. Circular Dependency Detection using DFS
    const circularDependencies = this.findCircularDependencies(nodes, edges);

    // 6. Semantic Node Classification & Importance Scoring
    const totalFiles = fileIds.size;

    for (const node of nodes) {
      if (node.type === "file") {
        const imports = fileImportsCount.get(node.id) || 0;
        const importedBy = fileImportedByCount.get(node.id) || 0;

        node.metadata.imports = imports;
        node.metadata.importedBy = importedBy;
        node.metadata.dependencyScore = imports + importedBy;
        node.metadata.relationshipDensity =
          totalFiles > 1
            ? parseFloat(((imports + importedBy) / (totalFiles - 1)).toFixed(3))
            : 0;
        node.metadata.isLeaf = imports === 0;

        // Classify Semantic Type
        node.metadata.semanticType = this.classifyNode(
          node.id,
          node.type,
          node.name,
          node.metadata.extension,
          node.metadata.isEntryPoint,
        );

        // Calculate Importance Score
        node.metadata.importanceScore = this.calculateImportanceScore(
          node.type,
          node.metadata.isEntryPoint || false,
          imports,
          importedBy,
          node.metadata.depth,
        );
      } else {
        // Folders
        node.metadata.isLeaf = node.children.length === 0;
        node.metadata.semanticType = this.classifyNode(
          node.id,
          node.type,
          node.name,
        );
        node.metadata.importanceScore = this.calculateImportanceScore(
          node.type,
          false,
          0,
          0,
          node.metadata.depth,
        );
      }
    }

    // 7. Calculate Statistics
    let totalFolders = 0;
    let maxDepth = 0;
    let repoSize = 0;
    const languages: Record<string, number> = {};

    for (const node of nodes) {
      if (node.type === "file") {
        repoSize += node.metadata.size;
        maxDepth = Math.max(maxDepth, node.metadata.depth);

        const lang = node.metadata.language || "Unknown";
        languages[lang] = (languages[lang] || 0) + 1;
      } else if (node.type === "folder") {
        totalFolders++;
        maxDepth = Math.max(maxDepth, node.metadata.depth);
      }
    }

    let largestFolderId = "None";
    let largestFolderSize = -1;
    for (const [folderId, size] of folderSizes.entries()) {
      if (folderId !== rootId && size > largestFolderSize) {
        largestFolderSize = size;
        largestFolderId = folderId;
      }
    }

    const languageStats = Object.entries(languages)
      .map(([name, count]) => ({
        name,
        files: count,
        percentage:
          totalFiles > 0
            ? parseFloat(((count / totalFiles) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.files - a.files);

    const statistics: RepositoryStatistics = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalFolders,
      totalFiles,
      totalImports: edges.filter((e) => e.type === "import").length,
      maxDepth,
      largestFolder: largestFolderId,
      languages: languageStats,
      repositorySize: repoSize,
    };

    return {
      nodes,
      edges,
      statistics,
      circularDependencies,
      externalPackages: Array.from(globalExternalPackages).map((pkg) =>
        this.getExternalPackageName(pkg),
      ),
    };
  }

  private parseFileImportsAndExports(
    filePath: string,
    content: string,
  ): { imports: string[]; exports: string[]; external: string[] } {
    const imports: string[] = [];
    const exports: string[] = [];
    const external: string[] = [];

    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
      );

      const visit = (node: ts.Node) => {
        // 1. Static Import Declarations
        if (ts.isImportDeclaration(node)) {
          if (
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            const specifier = node.moduleSpecifier.text;
            imports.push(specifier);
            if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
              external.push(specifier);
            }
          }
        }

        // 2. Export Declarations (e.g. export { x } from './y' or export { x })
        if (ts.isExportDeclaration(node)) {
          if (
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            const specifier = node.moduleSpecifier.text;
            imports.push(specifier);
            if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
              external.push(specifier);
            }
          }
          if (node.exportClause) {
            if (ts.isNamedExports(node.exportClause)) {
              for (const spec of node.exportClause.elements) {
                exports.push(spec.name.text);
              }
            }
          }
        }

        // 3. Dynamic Imports: import('./x')
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword
        ) {
          const firstArg = node.arguments[0];
          if (firstArg && ts.isStringLiteral(firstArg)) {
            const specifier = firstArg.text;
            imports.push(specifier);
            if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
              external.push(specifier);
            }
          }
        }

        // 4. Export Assignments (e.g. export default x)
        if (ts.isExportAssignment(node)) {
          exports.push("default");
        }

        // 5. Named exports (e.g. export const x = 1, export function f(), export class C)
        if (ts.canHaveModifiers(node)) {
          const modifiers = ts.getModifiers(node);
          if (
            modifiers &&
            modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
          ) {
            if (ts.isVariableStatement(node)) {
              for (const decl of node.declarationList.declarations) {
                if (ts.isIdentifier(decl.name)) {
                  exports.push(decl.name.text);
                }
              }
            } else if (ts.isFunctionDeclaration(node) && node.name) {
              exports.push(node.name.text);
            } else if (ts.isClassDeclaration(node) && node.name) {
              exports.push(node.name.text);
            } else if (ts.isInterfaceDeclaration(node) && node.name) {
              exports.push(node.name.text);
            } else if (ts.isTypeAliasDeclaration(node) && node.name) {
              exports.push(node.name.text);
            } else if (ts.isEnumDeclaration(node) && node.name) {
              exports.push(node.name.text);
            }
          }
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    } catch (err) {
      console.warn(`AST Parsing failed for ${filePath}:`, err);
    }

    return { imports, exports, external };
  }

  private resolveImportPath(
    currentFileId: string,
    specifier: string,
    fileIds: Set<string>,
  ): string | null {
    if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
      return null; // External package
    }

    const currentDir = path.dirname(currentFileId).replace(/\\/g, "/");
    let targetPath = path.resolve(currentDir, specifier).replace(/\\/g, "/");

    if (!targetPath.startsWith("/")) {
      targetPath = "/" + targetPath;
    }

    const extensionsToTry = [
      "",
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      "/index.ts",
      "/index.tsx",
      "/index.js",
      "/index.jsx",
    ];

    for (const ext of extensionsToTry) {
      const candidate = targetPath + ext;
      if (fileIds.has(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private getExternalPackageName(specifier: string): string {
    if (specifier.startsWith("@")) {
      const parts = specifier.split("/");
      return parts.slice(0, 2).join("/");
    }
    return specifier.split("/")[0];
  }

  private classifyNode(
    nodeId: string,
    type: "root" | "folder" | "file",
    name: string,
    extension?: string,
    isEntryPoint?: boolean,
  ): string {
    if (type === "root") return "Repository Root";

    const lowerName = name.toLowerCase();
    const lowerId = nodeId.toLowerCase();

    if (type === "folder") {
      if (lowerId.includes("/features/") || lowerId.endsWith("/features")) {
        return "Feature Folder";
      }
      if (
        ["utils", "helpers", "common", "lib", "services", "hooks"].includes(
          lowerName,
        )
      ) {
        return "Utility Folder";
      }
      if (
        ["config", "settings", "environments", ".github"].includes(lowerName)
      ) {
        return "Configuration Folder";
      }
      return "Folder";
    }

    if (isEntryPoint) return "Entry Point";

    if (
      lowerName === "package.json" ||
      lowerName === "tsconfig.json" ||
      lowerName.includes("config") ||
      lowerName.startsWith(".env") ||
      lowerName === ".gitignore"
    ) {
      return "Configuration File";
    }

    if (lowerName.startsWith("layout.")) return "Layout";
    if (lowerName.startsWith("page.")) return "Page";
    if (lowerId.includes("/pages/") && !lowerId.includes("/api/"))
      return "Page";

    if (lowerName.startsWith("use") || lowerName.includes(".hook."))
      return "Hook";

    if (lowerId.includes("/api/") || lowerName.startsWith("route."))
      return "API Route";

    if (
      lowerName.includes(".service.") ||
      lowerName.includes(".controller.") ||
      lowerName.includes(".resolver.")
    ) {
      return "Service";
    }

    if (
      extension === "tsx" ||
      extension === "jsx" ||
      lowerId.includes("/components/") ||
      lowerName.includes("component")
    ) {
      return "Component";
    }

    if (["css", "scss", "sass", "less"].includes(extension || "")) {
      return "Style";
    }

    if (["svg", "json", "md", "html"].includes(extension || "")) {
      if (lowerName === "readme.md") return "Configuration File";
      return "Asset";
    }

    return "Unknown";
  }

  private calculateImportanceScore(
    nodeType: "root" | "folder" | "file",
    isEntryPoint: boolean,
    imports: number,
    importedBy: number,
    depth: number,
  ): number {
    if (nodeType === "root") return 1.0;

    let base = 0.1;

    if (isEntryPoint) {
      base += 0.4;
    }

    base += Math.min(0.4, importedBy * 0.05);
    base += Math.min(0.1, imports * 0.02);

    const depthModifier = Math.max(0.5, 1.0 - depth * 0.05);

    return parseFloat(Math.min(1.0, base * depthModifier).toFixed(2));
  }

  private findCircularDependencies(
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): string[][] {
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      if (node.type === "file") {
        adj.set(node.id, []);
      }
    }
    for (const edge of edges) {
      if (edge.type === "import") {
        adj.get(edge.source)?.push(edge.target);
      }
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (curr: string, pathList: string[]) => {
      visited.add(curr);
      stack.add(curr);
      pathList.push(curr);

      const neighbors = adj.get(curr) || [];
      for (const next of neighbors) {
        if (stack.has(next)) {
          const cycleStartIndex = pathList.indexOf(next);
          if (cycleStartIndex !== -1) {
            const cycle = pathList.slice(cycleStartIndex);
            cycles.push(cycle);
          }
        } else if (!visited.has(next)) {
          dfs(next, pathList);
        }
      }

      pathList.pop();
      stack.delete(curr);
    };

    for (const node of nodes) {
      if (node.type === "file" && !visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }
}
