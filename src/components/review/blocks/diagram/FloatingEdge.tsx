
// ABOUTME: Custom floating edge component for React Flow diagrams
// Provides a simple styled edge with an optional label

import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { DiagramEdgeData } from '@/types/review';

const FloatingEdge: React.FC<EdgeProps<DiagramEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
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
        style={{ stroke: '#777', strokeWidth: 2, ...style }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              background: '#f0f0f0',
              padding: '2px 4px',
              borderRadius: '3px',
              pointerEvents: 'all',
              color: '#333',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default FloatingEdge;
