
// ABOUTME: Connection/arrow component for linking diagram nodes
// Handles different arrow types, curved connections, and interactive editing

import React, { useState } from 'react';
import { DiagramConnection } from '@/types/review';

interface DiagramConnectionComponentProps {
  connection: DiagramConnection;
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
  onDelete: () => void;
  readonly?: boolean;
}

export const DiagramConnectionComponent: React.FC<DiagramConnectionComponentProps> = ({
  connection,
  sourcePoint,
  targetPoint,
  onDelete,
  readonly = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const generatePath = () => {
    const { x1, y1 } = { x1: sourcePoint.x, y1: sourcePoint.y };
    const { x2, y2 } = { x2: targetPoint.x, y2: targetPoint.y };

    if (connection.style.curved) {
      // Create a curved path using cubic bezier
      const controlOffset = Math.abs(x2 - x1) * 0.5;
      const cx1 = x1 + controlOffset;
      const cy1 = y1;
      const cx2 = x2 - controlOffset;
      const cy2 = y2;
      
      return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    } else {
      // Straight line
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };

  const generateArrowMarker = () => {
    const markerId = `arrow-${connection.id}`;
    
    switch (connection.style.arrowType) {
      case 'arrow':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0,0 0,6 9,3"
                fill={connection.style.strokeColor}
                opacity={connection.style.opacity}
              />
            </marker>
          </defs>
        );
      
      case 'double-arrow':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth="12"
              markerHeight="10"
              refX="10"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0,0 0,6 4,3"
                fill={connection.style.strokeColor}
                opacity={connection.style.opacity}
              />
              <polygon
                points="5,0 5,6 9,3"
                fill={connection.style.strokeColor}
                opacity={connection.style.opacity}
              />
            </marker>
          </defs>
        );
      
      case 'circle':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <circle
                cx="4"
                cy="4"
                r="3"
                fill="none"
                stroke={connection.style.strokeColor}
                strokeWidth="1"
                opacity={connection.style.opacity}
              />
            </marker>
          </defs>
        );
      
      case 'diamond':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="5,1 9,5 5,9 1,5"
                fill={connection.style.strokeColor}
                opacity={connection.style.opacity}
              />
            </marker>
          </defs>
        );
      
      default:
        return null;
    }
  };

  const getLabelPosition = () => {
    if (!connection.label) return { x: 0, y: 0 };
    
    const { x1, y1 } = { x1: sourcePoint.x, y1: sourcePoint.y };
    const { x2, y2 } = { x2: targetPoint.x, y2: targetPoint.y };
    
    const t = connection.label.position;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    
    return { x, y };
  };

  const markerId = `arrow-${connection.id}`;
  const path = generatePath();
  const labelPos = getLabelPosition();

  return (
    <g className="diagram-connection">
      {/* Arrow Marker Definition */}
      {generateArrowMarker()}
      
      {/* Connection Path */}
      <path
        d={path}
        stroke={connection.style.strokeColor}
        strokeWidth={connection.style.strokeWidth}
        strokeDasharray={
          connection.style.strokeStyle === 'dashed' ? '8,4' :
          connection.style.strokeStyle === 'dotted' ? '2,2' : 'none'
        }
        fill="none"
        opacity={connection.style.opacity}
        markerEnd={connection.style.arrowType !== 'none' ? `url(#${markerId})` : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: readonly ? 'default' : 'pointer' }}
      />
      
      {/* Interactive Hit Area (wider invisible path for easier selection) */}
      {!readonly && (
        <path
          d={path}
          stroke="transparent"
          strokeWidth={Math.max(10, connection.style.strokeWidth + 6)}
          fill="none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 2) { // Double click
              onDelete();
            }
          }}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {/* Hover Effect */}
      {isHovered && !readonly && (
        <path
          d={path}
          stroke={connection.style.strokeColor}
          strokeWidth={connection.style.strokeWidth + 2}
          strokeDasharray={
            connection.style.strokeStyle === 'dashed' ? '8,4' :
            connection.style.strokeStyle === 'dotted' ? '2,2' : 'none'
          }
          fill="none"
          opacity="0.5"
          markerEnd={connection.style.arrowType !== 'none' ? `url(#${markerId})` : undefined}
        />
      )}
      
      {/* Connection Label */}
      {connection.label && (
        <g>
          <rect
            x={labelPos.x - 20}
            y={labelPos.y - 10}
            width="40"
            height="20"
            rx="3"
            fill={connection.label.style.backgroundColor}
            stroke={connection.style.strokeColor}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={connection.label.style.textColor}
            fontSize={connection.label.style.fontSize}
            style={{ userSelect: 'none' }}
          >
            {connection.label.text}
          </text>
        </g>
      )}
      
      {/* Delete Button (on hover) */}
      {isHovered && !readonly && (
        <g>
          <circle
            cx={labelPos.x}
            cy={labelPos.y - 15}
            r="8"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={labelPos.x}
            y={labelPos.y - 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="10"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
};
