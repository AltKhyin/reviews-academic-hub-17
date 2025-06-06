
// ABOUTME: Individual diagram node component with shape rendering and interaction
// Handles different node types, styling, text editing, and drag operations

import React, { useState, useRef, useCallback } from 'react';
import { DiagramNode } from '@/types/review';
import { cn } from '@/lib/utils';

interface DiagramNodeComponentProps {
  node: DiagramNode;
  isSelected: boolean;
  onUpdate: (updates: Partial<DiagramNode>) => void;
  onClick: (event: React.MouseEvent) => void;
  readonly?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export const DiagramNodeComponent: React.FC<DiagramNodeComponentProps> = ({
  node,
  isSelected,
  onUpdate,
  onClick,
  readonly = false,
  snapToGrid = true,
  gridSize = 20
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (readonly || isEditing) return;
    
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
    if (!svgRect) return;

    setIsDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y
    });

    onClick(event);
  }, [readonly, isEditing, node.position, onClick]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragStart || readonly) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    const newX = snapToGridValue(Math.max(0, dragStart.nodeX + deltaX));
    const newY = snapToGridValue(Math.max(0, dragStart.nodeY + deltaY));

    onUpdate({
      position: { x: newX, y: newY }
    });
  }, [isDragging, dragStart, readonly, snapToGridValue, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (readonly) return;
    
    event.stopPropagation();
    setIsEditing(true);
  }, [readonly]);

  const handleTextChange = useCallback((newText: string) => {
    onUpdate({ text: newText });
  }, [onUpdate]);

  const handleTextSubmit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleTextSubmit();
    } else if (event.key === 'Escape') {
      setIsEditing(false);
    }
  }, [handleTextSubmit]);

  // Set up global mouse events for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Focus text input when editing starts
  React.useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
  }, [isEditing]);

  const renderShape = () => {
    const { position, size, style } = node;
    const commonProps = {
      fill: style.backgroundColor,
      stroke: style.borderColor,
      strokeWidth: style.borderWidth,
      strokeDasharray: style.borderStyle === 'dashed' ? '5,5' : style.borderStyle === 'dotted' ? '2,2' : 'none',
      opacity: style.opacity
    };

    switch (node.type) {
      case 'rectangle':
        return (
          <rect
            x={position.x}
            y={position.y}
            width={size.width}
            height={size.height}
            rx={style.borderRadius || 0}
            {...commonProps}
          />
        );

      case 'rounded-rect':
        return (
          <rect
            x={position.x}
            y={position.y}
            width={size.width}
            height={size.height}
            rx={Math.min(size.width, size.height) * 0.2}
            {...commonProps}
          />
        );

      case 'circle':
        const radius = Math.min(size.width, size.height) / 2;
        return (
          <circle
            cx={position.x + size.width / 2}
            cy={position.y + size.height / 2}
            r={radius}
            {...commonProps}
          />
        );

      case 'ellipse':
        return (
          <ellipse
            cx={position.x + size.width / 2}
            cy={position.y + size.height / 2}
            rx={size.width / 2}
            ry={size.height / 2}
            {...commonProps}
          />
        );

      case 'diamond':
        const centerX = position.x + size.width / 2;
        const centerY = position.y + size.height / 2;
        const halfWidth = size.width / 2;
        const halfHeight = size.height / 2;
        
        return (
          <polygon
            points={`${centerX},${position.y} ${position.x + size.width},${centerY} ${centerX},${position.y + size.height} ${position.x},${centerY}`}
            {...commonProps}
          />
        );

      case 'triangle':
        return (
          <polygon
            points={`${position.x + size.width / 2},${position.y} ${position.x + size.width},${position.y + size.height} ${position.x},${position.y + size.height}`}
            {...commonProps}
          />
        );

      case 'hexagon':
        const hexCenterX = position.x + size.width / 2;
        const hexCenterY = position.y + size.height / 2;
        const hexWidth = size.width / 2;
        const hexHeight = size.height / 2;
        const hexOffset = hexWidth * 0.3;
        
        return (
          <polygon
            points={`${hexCenterX - hexOffset},${position.y} ${hexCenterX + hexOffset},${position.y} ${position.x + size.width},${hexCenterY} ${hexCenterX + hexOffset},${position.y + size.height} ${hexCenterX - hexOffset},${position.y + size.height} ${position.x},${hexCenterY}`}
            {...commonProps}
          />
        );

      default:
        return (
          <rect
            x={position.x}
            y={position.y}
            width={size.width}
            height={size.height}
            {...commonProps}
          />
        );
    }
  };

  const textX = node.position.x + node.size.width / 2;
  const textY = node.position.y + node.size.height / 2;

  return (
    <g className="diagram-node">
      {/* Shape */}
      <g
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: readonly ? 'default' : 'pointer' }}
      >
        {renderShape()}
      </g>

      {/* Text */}
      {isEditing && !readonly ? (
        <foreignObject
          x={node.position.x}
          y={node.position.y}
          width={node.size.width}
          height={node.size.height}
        >
          <textarea
            ref={textRef}
            value={node.text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-2 text-center bg-transparent border-none outline-none resize-none"
            style={{
              color: node.style.textColor,
              fontSize: `${node.style.fontSize}px`,
              fontWeight: node.style.fontWeight,
              textAlign: node.style.textAlign
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={node.style.textColor}
          fontSize={node.style.fontSize}
          fontWeight={node.style.fontWeight}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          style={{ 
            cursor: readonly ? 'default' : 'pointer',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {node.text.split('\n').map((line, index) => (
            <tspan
              key={index}
              x={textX}
              dy={index === 0 ? 0 : node.style.fontSize * 1.2}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}

      {/* Selection Indicator */}
      {isSelected && !readonly && (
        <rect
          x={node.position.x - 2}
          y={node.position.y - 2}
          width={node.size.width + 4}
          height={node.size.height + 4}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.8"
        />
      )}

      {/* Resize Handles */}
      {isSelected && !readonly && (
        <g className="resize-handles">
          {[
            { x: node.position.x + node.size.width, y: node.position.y + node.size.height, cursor: 'se-resize' },
            { x: node.position.x + node.size.width, y: node.position.y, cursor: 'ne-resize' },
            { x: node.position.x, y: node.position.y + node.size.height, cursor: 'sw-resize' },
            { x: node.position.x, y: node.position.y, cursor: 'nw-resize' }
          ].map((handle, index) => (
            <rect
              key={index}
              x={handle.x - 4}
              y={handle.y - 4}
              width="8"
              height="8"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="1"
              style={{ cursor: handle.cursor }}
              onMouseDown={(e) => {
                e.stopPropagation();
                // TODO: Implement resize functionality
              }}
            />
          ))}
        </g>
      )}
    </g>
  );
};
