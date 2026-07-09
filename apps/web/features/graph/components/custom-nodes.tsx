import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Folder as FolderIcon, FileCode, Star } from "lucide-react";
import { NodeMetadata } from "@codeatlas/types";

interface NodeData {
  name: string;
  type: string;
  path: string;
  metadata?: NodeMetadata;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isFaded?: boolean;
}

// 1. Root Node Component
export const RootNode = memo(({ data }: { data: NodeData }) => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center p-4 bg-[#0A0A0A] border-2 border-[#4F8CFF] rounded-lg shadow-[0_0_24px_rgba(79,140,255,0.2)] select-none">
      <FolderIcon className="w-8 h-8 text-[#4F8CFF] mb-2" />
      <span className="font-semibold text-lg text-white font-montserrat tracking-wide">
        {data.name}
      </span>
      <span className="text-xs text-[#757575] mt-1">Repository Root</span>
    </div>
  );
});

RootNode.displayName = "RootNode";

// 2. Folder Node Component
export const FolderNode = memo(({ data }: { data: NodeData }) => {
  return (
    <div className="h-full w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,20,0.4)] pointer-events-none select-none relative transition-all duration-200">
      {/* Title bar at the top of the folder */}
      <div className="absolute top-0 left-0 right-0 h-10 px-4 flex items-center border-b border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,10,0.6)] rounded-t-lg pointer-events-auto">
        <FolderIcon className="w-4 h-4 text-[#4F8CFF] mr-2 shrink-0" />
        <span className="font-medium text-sm text-[#B5B5B5] truncate font-montserrat">
          {data.name}
        </span>
        {data.metadata?.semanticType &&
          data.metadata.semanticType !== "Folder" && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#757575] border border-[rgba(255,255,255,0.05)] font-mono">
              {data.metadata.semanticType}
            </span>
          )}
      </div>
    </div>
  );
});

FolderNode.displayName = "FolderNode";

// 3. File Node Component
export const FileNode = memo(({ data }: { data: NodeData }) => {
  const metadata = data.metadata;
  const isSelected = data.isSelected;
  const isHighlighted = data.isHighlighted;
  const isFaded = data.isFaded;

  // Language colored indicators
  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case "TypeScript":
      case "TSX":
        return "text-[#4F8CFF]";
      case "JavaScript":
      case "JSX":
        return "text-[#FFB547]";
      case "HTML":
        return "text-[#FF5F56]";
      case "CSS":
      case "SCSS":
        return "text-[#FF8CFF]";
      default:
        return "text-[#3DDC84]";
    }
  };

  const borderClass = isSelected
    ? "border-[#4F8CFF] shadow-[0_0_16px_rgba(79,140,255,0.45)] bg-[#0f172a]"
    : isHighlighted
      ? "border-[#3DDC84] shadow-[0_0_12px_rgba(61,220,132,0.3)] bg-[#061f14]"
      : "border-[rgba(255,255,255,0.08)] hover:border-[#4F8CFF]/50 bg-[#141414]";

  const opacityClass = isFaded ? "opacity-25" : "opacity-100";

  return (
    <div
      className={`h-full w-full flex items-center px-3 border rounded-md select-none transition-all duration-200 ${borderClass} ${opacityClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#4F8CFF",
          width: 6,
          height: 6,
          borderRadius: "50%",
        }}
      />

      <FileCode
        className={`w-4 h-4 mr-2.5 shrink-0 ${getLanguageColor(metadata?.language || "")}`}
      />

      <div className="flex flex-col min-w-0 mr-2">
        <span className="text-xs font-medium text-white truncate font-montserrat max-w-[120px]">
          {data.name}
        </span>
        <span className="text-[9px] text-[#757575] truncate">
          {metadata?.semanticType || "Module"}
        </span>
      </div>

      {metadata?.importanceScore !== undefined && (
        <div className="ml-auto flex items-center shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#1B1B1B] text-[#B5B5B5] border border-[rgba(255,255,255,0.05)] font-mono">
          <Star className="w-2.5 h-2.5 text-[#FFB547] mr-1" />
          {metadata.importanceScore.toFixed(2)}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#4F8CFF",
          width: 6,
          height: 6,
          borderRadius: "50%",
        }}
      />
    </div>
  );
});

FileNode.displayName = "FileNode";
