import { memo } from "react";
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow";

function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? "hsl(221.2 83.2% 53.3%)" : "hsl(215.4 16.3% 46.9%)",
          strokeWidth: selected ? 3 : 2,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        strokeDasharray="5 5"
        fill="none"
        markerEnd="url(#dependency-arrow)"
        data-testid={`dependency-edge-${id}`}
      />
      
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded border border-border shadow-sm"
          >
            Dependency
          </div>
        </EdgeLabelRenderer>
      )}
      
      <defs>
        <marker
          id="dependency-arrow"
          markerWidth="12"
          markerHeight="12"
          refX="11"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={selected ? "hsl(221.2 83.2% 53.3%)" : "hsl(215.4 16.3% 46.9%)"}
          />
        </marker>
      </defs>
    </>
  );
}

export default memo(DependencyEdge);
