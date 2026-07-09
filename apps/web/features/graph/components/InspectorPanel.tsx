import React from "react";
import {
  X,
  FileCode,
  Folder,
  Star,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";
import { useGraphStore } from "../store";

export function InspectorPanel() {
  const { selectedNodeId, setSelectedNodeId, rawNodes, rawEdges } =
    useGraphStore();

  const node = rawNodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return null;
  }


  const isFolder = node.type === "folder" || node.type === "root";
  const metadata = node.metadata;

  // Format File Size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Find incoming and outgoing imports
  const outgoingImports = rawEdges
    .filter((edge) => edge.source === node.id && edge.type === "import")
    .map((edge) => edge.target);

  const incomingImports = rawEdges
    .filter((edge) => edge.target === node.id && edge.type === "import")
    .map((edge) => edge.source);

  return (
    <div className="w-80 shrink-0 border-l border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] flex flex-col h-full overflow-hidden select-none font-montserrat">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[rgba(10,10,10,0.6)]">
        <h3 className="font-semibold text-sm text-white tracking-wide uppercase">
          Inspector
        </h3>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-[#757575] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        {/* Title Area */}
        <div className="flex items-start">
          {isFolder ? (
            <Folder className="w-5 h-5 text-[#4F8CFF] mr-3 mt-0.5 shrink-0" />
          ) : (
            <FileCode className="w-5 h-5 text-[#3DDC84] mr-3 mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base truncate">
              {node.name}
            </h4>
            <span className="text-[10px] text-[#757575] uppercase font-mono tracking-wider">
              {metadata.semanticType || node.type}
            </span>
          </div>
        </div>

        {/* Overview Section */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
            Overview
          </h5>
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.05)] rounded-md p-3.5 space-y-3 font-mono text-xs">
            <div>
              <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                Path
              </span>
              <span className="text-[#B5B5B5] break-all leading-normal">
                {node.path || "/"}
              </span>
            </div>
            {!isFolder && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                      Language
                    </span>
                    <span className="text-white">
                      {metadata.language || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                      Size
                    </span>
                    <span className="text-white">
                      {formatBytes(metadata.size)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                      Importance
                    </span>
                    <span className="text-[#FFB547] flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {metadata.importanceScore?.toFixed(2) || "0.0"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                      Entry Point
                    </span>
                    <span
                      className={
                        metadata.isEntryPoint
                          ? "text-[#3DDC84]"
                          : "text-[#757575]"
                      }
                    >
                      {metadata.isEntryPoint ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {isFolder && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                    Cumulative Size
                  </span>
                  <span className="text-white">
                    {formatBytes(metadata.size)}
                  </span>
                </div>
                <div>
                  <span className="text-[#757575] block text-[9px] uppercase mb-0.5">
                    Sub-items
                  </span>
                  <span className="text-white">{node.children.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Relationship Stats */}
        {!isFolder && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
              Dependency Metrics
            </h5>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-[#141414] border border-[rgba(255,255,255,0.05)] rounded-md p-3 text-center">
                <span className="text-2xl font-bold text-white leading-none block">
                  {metadata.imports}
                </span>
                <span className="text-[9px] text-[#757575] uppercase mt-1 block">
                  Imports
                </span>
              </div>
              <div className="bg-[#141414] border border-[rgba(255,255,255,0.05)] rounded-md p-3 text-center">
                <span className="text-2xl font-bold text-white leading-none block">
                  {metadata.importedBy}
                </span>
                <span className="text-[9px] text-[#757575] uppercase mt-1 block">
                  Imported By
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Relationships list */}
        {!isFolder && (
          <>
            {/* Outgoing Imports */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                Imports ({outgoingImports.length})
              </h5>
              {outgoingImports.length > 0 ? (
                <div className="max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                  {outgoingImports.map((target) => (
                    <div
                      key={target}
                      onClick={() => setSelectedNodeId(target)}
                      className="flex items-center text-[10px] text-[#B5B5B5] hover:text-white bg-[#141414] border border-[rgba(255,255,255,0.03)] px-2 py-1.5 rounded cursor-pointer transition-colors truncate"
                    >
                      <ArrowRight className="w-3 h-3 text-[#4F8CFF] mr-2 shrink-0" />
                      <span className="truncate">{target}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#757575] block italic">
                  No outgoing import connections
                </span>
              )}
            </div>

            {/* Incoming Imports */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                Imported By ({incomingImports.length})
              </h5>
              {incomingImports.length > 0 ? (
                <div className="max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                  {incomingImports.map((source) => (
                    <div
                      key={source}
                      onClick={() => setSelectedNodeId(source)}
                      className="flex items-center text-[10px] text-[#B5B5B5] hover:text-white bg-[#141414] border border-[rgba(255,255,255,0.03)] px-2 py-1.5 rounded cursor-pointer transition-colors truncate"
                    >
                      <CornerDownRight className="w-3 h-3 text-[#3DDC84] mr-2 shrink-0" />
                      <span className="truncate">{source}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#757575] block italic">
                  Not imported by other files
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
