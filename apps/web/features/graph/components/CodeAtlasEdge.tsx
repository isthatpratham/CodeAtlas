import React, { useEffect, useRef, useState } from "react";
import { EdgeProps, getBezierPath, getStraightPath } from "@xyflow/react";

export function CodeAtlasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isDrawing, setIsDrawing] = useState(true);

  // Compute the path based on edge type
  const isStraight = data?.edgeType === "hierarchy";

  const [edgePath] = isStraight
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  // Calculate length for progressive reveal (dash drawing)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (Number.isFinite(len) && len > 0) {
          setPathLength(len);
          setIsDrawing(true);
          // Trigger the animation in the next frame
          timer = setTimeout(() => {
            setIsDrawing(false);
          }, 30);
        }
      } catch (err) {
        console.error("Error measuring path length:", err);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sourceX, sourceY, targetX, targetY]);

  // Retrieve states from edge data
  const isCircular = !!data?.isCircular;
  const isPulseActive = !!data?.isPulseActive;
  const isSelected = !!data?.isSelected;
  const isHighlighted = !!data?.isHighlighted;
  const isFaded = !!data?.isFaded;

  // Determine styling based on type and states
  let strokeColor = "rgba(255, 255, 255, 0.08)"; // Hierarchy default (muted gray)
  let strokeWidth = 1;

  if (data?.edgeType === "import" || data?.edgeType === "dependency") {
    if (isCircular) {
      strokeColor = "#FFB547"; // Circular dependency: Amber
      strokeWidth = 2.0;
    } else if (isSelected) {
      strokeColor = "#3DDC84"; // Selected edge: Brighter green accent
      strokeWidth = 2.5;
    } else if (isHighlighted) {
      strokeColor = "#4F8CFF"; // Active dependency: Blue
      strokeWidth = 2.0;
    } else {
      strokeColor = "rgba(79, 140, 255, 0.4)"; // Normal dependency: Low opacity blue
      strokeWidth = 1.5;
    }
  } else {
    // Hierarchy Edge
    if (isSelected || isHighlighted) {
      strokeColor = "rgba(255, 255, 255, 0.4)"; // Highlighted hierarchy: brighter gray
      strokeWidth = 1.5;
    } else {
      strokeColor = "rgba(255, 255, 255, 0.08)"; // Regular hierarchy: thin, low opacity
      strokeWidth = 1;
    }
  }

  // Handle fading of unrelated relationships
  const opacity = isFaded ? 0.05 : 1.0;

  return (
    <>
      {/* Background wider interactive path for hover hits */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={10}
        className="react-flow__edge-interaction cursor-pointer"
      />

      {/* Main animated path */}
      <path
        ref={pathRef}
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        style={{
          strokeDasharray: pathLength || 1000,
          strokeDashoffset: isDrawing ? pathLength || 1000 : 0,
          transition:
            "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease",
          ...style,
        }}
        markerEnd={markerEnd}
      />

      {/* Directional traveling pulse overlay */}
      {isPulseActive && !isFaded && (
        <path
          d={edgePath}
          fill="none"
          stroke={isCircular ? "#FFB547" : "#4F8CFF"}
          strokeWidth={strokeWidth + 1}
          strokeDasharray="6 40"
          opacity={opacity}
          style={{
            animation: "codeatlas-pulse-flow 2s linear infinite",
          }}
        />
      )}
    </>
  );
}
