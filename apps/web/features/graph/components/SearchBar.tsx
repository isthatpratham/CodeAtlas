import React, { useState, useRef, useEffect } from "react";
import { Search, FileCode, Folder, CornerDownRight } from "lucide-react";
import { useGraphStore } from "../store";
import { useReactFlow } from "@xyflow/react";

export function SearchBar() {
  const { searchQuery, setSearchQuery, searchResults, setSelectedNodeId } =
    useGraphStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setCenter, getNode } = useReactFlow();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectResult = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsOpen(false);
    setSearchQuery("");

    // Center camera on node
    const node = getNode(nodeId);
    if (node) {
      const width = node.measured?.width || node.style?.width || 220;
      const height = node.measured?.height || node.style?.height || 64;

      // Calculate absolute node coordinates depending on parentId nesting
      let x = node.position.x + Number(width) / 2;
      let y = node.position.y + Number(height) / 2;

      // Handle nested positions
      let parent = node.parentId ? getNode(node.parentId) : null;
      while (parent) {
        x += parent.position.x;
        y += parent.position.y;
        parent = parent.parentId ? getNode(parent.parentId) : null;
      }

      setCenter(x, y, { zoom: 1.5, duration: 800 });
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-80 font-montserrat">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[#757575]" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search files or folders..."
          className="w-full h-9 pl-9 pr-4 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#141414] text-xs text-white placeholder-[#757575] focus:outline-none focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30 transition-all font-sans"
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-11 left-0 right-0 max-h-80 overflow-y-auto rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] shadow-[0_4px_24px_rgba(0,0,0,0.8)] z-50 divide-y divide-[rgba(255,255,255,0.03)] scrollbar-thin">
          {searchResults.map((result) => (
            <div
              key={result.id}
              onClick={() => handleSelectResult(result.id)}
              className="flex items-center px-4 py-2.5 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer select-none group transition-all"
            >
              {result.type === "folder" ? (
                <Folder className="w-4 h-4 text-[#4F8CFF] mr-3 shrink-0" />
              ) : (
                <FileCode className="w-4 h-4 text-[#3DDC84] mr-3 shrink-0" />
              )}

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate group-hover:text-[#4F8CFF] transition-colors leading-none mb-1">
                  {result.name}
                </span>
                <span className="text-[9px] text-[#757575] truncate flex items-center font-mono">
                  <CornerDownRight className="w-2 h-2 mr-1 shrink-0" />
                  {result.path || "/"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
