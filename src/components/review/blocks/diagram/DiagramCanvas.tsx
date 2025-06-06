
// ABOUTME: Interactive canvas for diagram creation with SVG-based rendering
// Handles node manipulation, connections, and visual editing

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DiagramContent, DiagramNode, DiagramConnection } from '@/types/review';
import { DiagramNodeComponent } from './DiagramNodeComponent';
import { DiagramConnectionComponent } from './DiagramConnectionComponent';
import { DiagramGrid } from './DiagramGrid';
import { cn } from '@/lib/utils';

interface DiagramCanvasProps {
  content: DiagramContent;
  mode: 'edit' | 'preview';
  selectedTool: string;
  selectedNodes: string[];
  onNodeAdd: (nodeType: string, position: { x: number; y: number }) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<DiagramNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionAdd: (connection: DiagramConnection) => void;
  onConnectionDelete: (connectionId: string) => void;
  onSelectionChange: (nodeIds: string[]) => void;
  readonly?: boolean;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  content,
  mode,
  selectedTool,
  selectedNodes,
  onNodeAdd,
  onNodeUpdate,
  onNodeDelete,
  onConnectionAdd,
  onConnectionDelete,
  onSelectionChange,
  readonly = false
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    sourceNodeId: string;
    sourcePoint: string;
    currentPosition: { x: number; y: number };
  } | null>(null);

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: content.canvas.width,
    height: content.canvas.height
  });

  const [zoom, setZoom] = useState(1);

  const handleCanvasClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (readonly || mode === 'preview') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Clear selection if clicking on empty space
    if (event.target === canvasRef.current) {
      onSelectionChange([]);
    }

    // Handle node creation tools
    if (selectedTool !== 'select' && selectedTool !== 'connect' && selectedTool !== 'pan') {
      onNodeAdd(selectedTool, { x, y });
    }
  }, [readonly, mode, selectedTool, zoom, onSelectionChange, onNodeAdd]);

  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (readonly) return;

    event.stopPropagation();

    if (selectedTool === 'connect') {
      if (pendingConnection) {
        // Complete connection
        if (pendingConnection.sourceNodeId !== nodeId) {
          const newConnection: DiagramConnection = {
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sourceNodeId: pendingConnection.sourceNodeId,
            targetNodeId: nodeId,
            sourcePoint: pendingConnection.sourcePoint as any,
            targetPoint: 'left',
            style: {
              strokeColor: '#6b7280',
              strokeWidth: 2,
              strokeStyle: 'solid',
              arrowType: 'arrow',
              curved: false,
              opacity: 1
            }
          };
          onConnectionAdd(newConnection);
        }
        setPendingConnection(null);
      } else {
        // Start connection
        setPendingConnection({
          sourceNodeId: nodeId,
          sourcePoint: 'right',
          currentPosition: { x: 0, y: 0 }
        });
      }
    } else if (selectedTool === 'select') {
      // Handle selection
      if (event.ctrlKey || event.metaKey) {
        // Multi-select
        const newSelection = selectedNodes.includes(nodeId)
          ? selectedNodes.filter(id => id !== nodeId)
          : [...selectedNodes, nodeId];
        onSelectionChange(newSelection);
      } else {
        // Single select
        onSelectionChange([nodeId]);
      }
    }
  }, [readonly, selectedTool, pendingConnection, selectedNodes, onConnectionAdd, onSelectionChange]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (pendingConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;

      setPendingConnection(prev => prev ? {
        ...prev,
        currentPosition: { x, y }
      } : null);
    }
  }, [pendingConnection, zoom]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readonly) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      selectedNodes.forEach(nodeId => {
        onNodeDelete(nodeId);
      });
      onSelectionChange([]);
    }

    if (event.key === 'Escape') {
      setPendingConnection(null);
      onSelectionChange([]);
    }
  }, [readonly, selectedNodes, onNodeDelete, onSelectionChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getNodeConnectionPoint = (node: DiagramNode, point: string): { x: number; y: number } => {
    const { position, size } = node;
    
    switch (point) {
      case 'top':
        return { x: position.x + size.width / 2, y: position.y };
      case 'right':
        return { x: position.x + size.width, y: position.y + size.height / 2 };
      case 'bottom':
        return { x: position.x + size.width / 2, y: position.y + size.height };
      case 'left':
        return { x: position.x, y: position.y + size.height / 2 };
      case 'center':
      default:
        return { x: position.x + size.width / 2, y: position.y + size.height / 2 };
    }
  };

  return (
    <div 
      className={cn(
        "diagram-canvas-container relative overflow-hidden",
        mode === 'edit' ? "cursor-crosshair" : "cursor-default"
      )}
      style={{ 
        width: content.canvas.width,
        height: content.canvas.height,
        maxWidth: '100%',
        maxHeight: '70vh'
      }}
    >
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ backgroundColor: content.canvas.backgroundColor }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="w-full h-full"
      >
        {/* Grid */}
        {content.canvas.gridEnabled && mode === 'edit' && (
          <DiagramGrid
            size={content.canvas.gridSize}
            color={content.canvas.gridColor}
            viewBox={viewBox}
          />
        )}

        {/* Connections */}
        {content.connections.map(connection => {
          const sourceNode = content.nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = content.nodes.find(n => n.id === connection.targetNodeId);
          
          if (!sourceNode || !targetNode) return null;

          const sourcePoint = getNodeConnectionPoint(sourceNode, connection.sourcePoint);
          const targetPoint = getNodeConnectionPoint(targetNode, connection.targetPoint);

          return (
            <DiagramConnectionComponent
              key={connection.id}
              connection={connection}
              sourcePoint={sourcePoint}
              targetPoint={targetPoint}
              onDelete={() => onConnectionDelete(connection.id)}
              readonly={readonly || mode === 'preview'}
            />
          );
        })}

        {/* Pending Connection */}
        {pendingConnection && (
          <line
            x1={getNodeConnectionPoint(
              content.nodes.find(n => n.id === pendingConnection.sourceNodeId)!,
              pendingConnection.sourcePoint
            ).x}
            y1={getNodeConnectionPoint(
              content.nodes.find(n => n.id === pendingConnection.sourceNodeId)!,
              pendingConnection.sourcePoint
            ).y}
            x2={pendingConnection.currentPosition.x}
            y2={pendingConnection.currentPosition.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        )}

        {/* Nodes */}
        {content.nodes.map(node => (
          <DiagramNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            onUpdate={(updates) => onNodeUpdate(node.id, updates)}
            onClick={(event) => handleNodeClick(node.id, event)}
            readonly={readonly || mode === 'preview'}
            snapToGrid={content.canvas.snapToGrid}
            gridSize={content.canvas.gridSize}
          />
        ))}
      </svg>

      {/* Canvas overlay for zoom/pan controls */}
      {mode === 'edit' && !readonly && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            +
          </button>
          <span className="px-2 py-1 text-xs bg-gray-800 text-white rounded">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            -
          </button>
        </div>
      )}
    </div>
  );
};
