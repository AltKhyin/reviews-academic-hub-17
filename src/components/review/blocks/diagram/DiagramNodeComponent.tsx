
// ABOUTME: Enhanced diagram node with auto-selection, inline editing, and smart interactions
// Handles contextual actions, text editing with formatting, and smart positioning

import React, { useState, useRef, useCallback } from 'react';
import { DiagramNode } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Bold, Italic, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramNodeComponentProps {
  node: DiagramNode;
  isSelected: boolean;
  onUpdate: (updates: Partial<DiagramNode>) => void;
  onClick: (event: React.MouseEvent) => void;
  onDuplicate?: (direction: 'top' | 'right' | 'bottom' | 'left') => void;
  onDelete?: () => void;
  readonly?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export const DiagramNodeComponent: React.FC<DiagramNodeComponentProps> = ({
  node,
  isSelected,
  onUpdate,
  onClick,
  onDuplicate,
  onDelete,
  readonly = false,
  snapToGrid = true,
  gridSize = 20
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
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
    
    // Auto-select regardless of current tool
    onClick(event);
    
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

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (readonly) return;
    
    event.stopPropagation();
    
    // Auto-select on click
    onClick(event);
    
    // Start editing on click
    setIsEditing(true);
  }, [readonly, onClick]);

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

  const handleFontSizeChange = useCallback((delta: number) => {
    const newSize = Math.max(8, Math.min(32, (node.style.fontSize || 14) + delta));
    onUpdate({
      style: {
        ...node.style,
        fontSize: newSize
      }
    });
  }, [node.style, onUpdate]);

  const handleFontWeightToggle = useCallback(() => {
    const newWeight = node.style.fontWeight === 'bold' ? 'normal' : 'bold';
    onUpdate({
      style: {
        ...node.style,
        fontWeight: newWeight
      }
    });
  }, [node.style, onUpdate]);

  const handleDuplicateClick = useCallback((direction: 'top' | 'right' | 'bottom' | 'left', event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDuplicate) {
      onDuplicate(direction);
    }
  }, [onDuplicate]);

  const handleDeleteClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

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
      stroke: isSelected ? '#3b82f6' : style.borderColor,
      strokeWidth: isSelected ? 3 : style.borderWidth,
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
        const hexOffset = size.width * 0.3;
        
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
    <g 
      className="diagram-node"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Shape */}
      <g
        onMouseDown={handleMouseDown}
        onClick={handleClick}
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
          <div className="w-full h-full flex flex-col">
            {/* Text Formatting Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-gray-800 border border-gray-600 rounded-t mb-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFontSizeChange(-2)}
                className="h-6 w-6 p-0 text-xs"
              >
                -
              </Button>
              <span className="text-xs text-white px-1">{node.style.fontSize}px</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFontSizeChange(2)}
                className="h-6 w-6 p-0 text-xs"
              >
                +
              </Button>
              <Button
                size="sm"
                variant={node.style.fontWeight === 'bold' ? 'default' : 'ghost'}
                onClick={handleFontWeightToggle}
                className="h-6 w-6 p-0"
              >
                <Bold className="w-3 h-3" />
              </Button>
            </div>
            
            <textarea
              ref={textRef}
              value={node.text}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 text-center bg-transparent border border-gray-400 rounded-b outline-none resize-none"
              style={{
                color: node.style.textColor,
                fontSize: `${node.style.fontSize}px`,
                fontWeight: node.style.fontWeight,
                textAlign: node.style.textAlign
              }}
            />
          </div>
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
          onClick={handleClick}
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

      {/* Hover Actions */}
      {isHovering && !readonly && !isEditing && (
        <g className="hover-actions">
          {/* Duplicate buttons in 4 quadrants */}
          <g
            className="duplicate-top"
            transform={`translate(${node.position.x + node.size.width / 2 - 10}, ${node.position.y - 15})`}
            onClick={(e) => handleDuplicateClick('top', e)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
            <Plus className="w-4 h-4" x="6" y="6" fill="#ffffff" />
          </g>
          
          <g
            className="duplicate-right"
            transform={`translate(${node.position.x + node.size.width + 5}, ${node.position.y + node.size.height / 2 - 10})`}
            onClick={(e) => handleDuplicateClick('right', e)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
            <Plus className="w-4 h-4" x="6" y="6" fill="#ffffff" />
          </g>
          
          <g
            className="duplicate-bottom"
            transform={`translate(${node.position.x + node.size.width / 2 - 10}, ${node.position.y + node.size.height + 5})`}
            onClick={(e) => handleDuplicateClick('bottom', e)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
            <Plus className="w-4 h-4" x="6" y="6" fill="#ffffff" />
          </g>
          
          <g
            className="duplicate-left"
            transform={`translate(${node.position.x - 25}, ${node.position.y + node.size.height / 2 - 10})`}
            onClick={(e) => handleDuplicateClick('left', e)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
            <Plus className="w-4 h-4" x="6" y="6" fill="#ffffff" />
          </g>

          {/* Delete button */}
          <g
            className="delete-button"
            transform={`translate(${node.position.x + node.size.width - 10}, ${node.position.y - 10})`}
            onClick={handleDeleteClick}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="10" cy="10" r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
            <Trash2 className="w-4 h-4" x="6" y="6" fill="#ffffff" />
          </g>
        </g>
      )}
    </g>
  );
};
