
// ABOUTME: Enhanced interactive canvas with proper panning, auto-sizing, and smart interactions
// Handles node manipulation, connections, visual editing, and responsive sizing

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
  fullscreen?: boolean;
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
  readonly = false,
  fullscreen = false
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    sourceNodeId: string;
    sourcePoint: string;
    currentPosition: { x: number; y: number };
  } | null>(null);

  // Auto-sizing based on container or fullscreen
  const [canvasSize, setCanvasSize] = useState({
    width: fullscreen ? window.innerWidth - 100 : 800,
    height: fullscreen ? window.innerHeight - 200 : 600
  });

  // Provide default canvas settings
  const defaultCanvas = {
    width: canvasSize.width,
    height: canvasSize.height,
    backgroundColor: '#ffffff',
    gridEnabled: true,
    gridSize: 20,
    gridColor: '#e5e7eb',
    snapToGrid: true
  };

  // Override canvas size constraints in fullscreen
  const canvas = fullscreen ? {
    ...defaultCanvas,
    width: canvasSize.width,
    height: canvasSize.height
  } : (content?.canvas || defaultCanvas);

  const nodes = content?.nodes || [];
  const connections = content?.connections || [];

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  });

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Auto-resize when window size changes in fullscreen
  useEffect(() => {
    if (!fullscreen) return;

    const handleResize = () => {
      const newSize = {
        width: window.innerWidth - 100,
        height: window.innerHeight - 200
      };
      setCanvasSize(newSize);
      setViewBox(prev => ({
        ...prev,
        width: newSize.width,
        height: newSize.height
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fullscreen]);

  // Auto-fit diagram to viewport
  const autoFitDiagram = useCallback(() => {
    if (nodes.length === 0) return;

    const bounds = nodes.reduce((acc, node) => {
      const right = node.position.x + node.size.width;
      const bottom = node.position.y + node.size.height;
      
      return {
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, right),
        maxY: Math.max(acc.maxY, bottom)
      };
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    const padding = 50;
    const diagramWidth = bounds.maxX - bounds.minX + 2 * padding;
    const diagramHeight = bounds.maxY - bounds.minY + 2 * padding;
    
    const scaleX = canvas.width / diagramWidth;
    const scaleY = canvas.height / diagramHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    setZoom(scale);
    setPanOffset({
      x: bounds.minX - padding,
      y: bounds.minY - padding
    });
  }, [nodes, canvas.width, canvas.height]);

  // Auto-fit on mount and when nodes change significantly
  useEffect(() => {
    if (nodes.length > 0 && mode === 'preview') {
      autoFitDiagram();
    }
  }, [nodes.length, mode, autoFitDiagram]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (readonly || mode === 'preview') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - panOffset.x) / zoom;
    const y = (event.clientY - rect.top - panOffset.y) / zoom;

    // Check if clicking on empty space
    if (event.target === canvasRef.current) {
      if (selectedTool === 'pan' || event.ctrlKey || event.metaKey) {
        // Start panning
        setIsPanning(true);
        setDragStart({ x: event.clientX, y: event.clientY });
      } else {
        // Clear selection
        onSelectionChange([]);

        // Handle node creation tools
        if (selectedTool !== 'select' && selectedTool !== 'connect') {
          onNodeAdd(selectedTool, { x, y });
        }
      }
    }
  }, [readonly, mode, selectedTool, zoom, panOffset, onSelectionChange, onNodeAdd]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (pendingConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (event.clientX - rect.left - panOffset.x) / zoom;
      const y = (event.clientY - rect.top - panOffset.y) / zoom;

      setPendingConnection(prev => prev ? {
        ...prev,
        currentPosition: { x, y }
      } : null);
    }
  }, [pendingConnection, zoom, panOffset]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragStart(null);
  }, []);

  // Global mouse events for panning
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isPanning && dragStart) {
        const deltaX = event.clientX - dragStart.x;
        const deltaY = event.clientY - dragStart.y;
        
        setPanOffset(prev => ({
          x: prev.x - deltaX / zoom,
          y: prev.y - deltaY / zoom
        }));
        
        setDragStart({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDragStart(null);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, dragStart, zoom]);

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
    } else {
      // Auto-select node regardless of tool
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

  const handleNodeDuplicate = useCallback((nodeId: string, direction: 'top' | 'right' | 'bottom' | 'left') => {
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    const offset = 150;
    let newPosition = { ...sourceNode.position };

    switch (direction) {
      case 'top':
        newPosition.y -= offset;
        break;
      case 'right':
        newPosition.x += offset;
        break;
      case 'bottom':
        newPosition.y += offset;
        break;
      case 'left':
        newPosition.x -= offset;
        break;
    }

    // Ensure new position doesn't overlap with existing nodes
    const hasOverlap = nodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - newPosition.x, 2) + 
        Math.pow(node.position.y - newPosition.y, 2)
      );
      return distance < 100 && node.id !== nodeId;
    });

    if (hasOverlap) {
      // Find a better position
      const angle = Math.random() * 2 * Math.PI;
      newPosition.x += Math.cos(angle) * offset;
      newPosition.y += Math.sin(angle) * offset;
    }

    // Create new node
    const newNode: DiagramNode = {
      ...sourceNode,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: newPosition
    };

    onNodeUpdate('temp', newNode); // This will be handled by the parent

    // Create connection
    const connectionPoints = {
      top: { source: 'top', target: 'bottom' },
      right: { source: 'right', target: 'left' },
      bottom: { source: 'bottom', target: 'top' },
      left: { source: 'left', target: 'right' }
    };

    const points = connectionPoints[direction];
    const newConnection: DiagramConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: nodeId,
      targetNodeId: newNode.id,
      sourcePoint: points.source as any,
      targetPoint: points.target as any,
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
  }, [nodes, onNodeUpdate, onConnectionAdd]);

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

    // Zoom controls
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '=' || event.key === '+') {
        event.preventDefault();
        setZoom(prev => Math.min(2, prev * 1.1));
      } else if (event.key === '-') {
        event.preventDefault();
        setZoom(prev => Math.max(0.1, prev * 0.9));
      } else if (event.key === '0') {
        event.preventDefault();
        autoFitDiagram();
      }
    }
  }, [readonly, selectedNodes, onNodeDelete, onSelectionChange, autoFitDiagram]);

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

  const effectiveViewBox = `${panOffset.x} ${panOffset.y} ${canvas.width / zoom} ${canvas.height / zoom}`;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "diagram-canvas-container relative overflow-hidden border rounded",
        mode === 'edit' && !isPanning ? "cursor-crosshair" : "cursor-default",
        isPanning && "cursor-move"
      )}
      style={{ 
        width: '100%',
        height: fullscreen ? '100%' : Math.min(canvas.height, window.innerHeight * 0.7),
        borderColor: '#2a2a2a',
        backgroundColor: canvas.backgroundColor
      }}
    >
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={effectiveViewBox}
        style={{ backgroundColor: canvas.backgroundColor }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="w-full h-full"
      >
        {/* Grid */}
        {canvas.gridEnabled && mode === 'edit' && !fullscreen && (
          <DiagramGrid
            size={canvas.gridSize}
            color={canvas.gridColor}
            viewBox={{
              x: panOffset.x,
              y: panOffset.y,
              width: canvas.width / zoom,
              height: canvas.height / zoom
            }}
          />
        )}

        {/* Connections */}
        {connections.map(connection => {
          const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = nodes.find(n => n.id === connection.targetNodeId);
          
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
              nodes.find(n => n.id === pendingConnection.sourceNodeId)!,
              pendingConnection.sourcePoint
            ).x}
            y1={getNodeConnectionPoint(
              nodes.find(n => n.id === pendingConnection.sourceNodeId)!,
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
        {nodes.map(node => (
          <DiagramNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            onUpdate={(updates) => onNodeUpdate(node.id, updates)}
            onClick={(event) => handleNodeClick(node.id, event)}
            onDuplicate={(direction) => handleNodeDuplicate(node.id, direction)}
            onDelete={() => onNodeDelete(node.id)}
            readonly={readonly || mode === 'preview'}
            snapToGrid={canvas.snapToGrid && !fullscreen}
            gridSize={canvas.gridSize}
          />
        ))}
      </svg>

      {/* Canvas controls */}
      {mode === 'edit' && !readonly && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => setZoom(Math.min(2, zoom * 1.1))}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
            title="Zoom In (Ctrl + +)"
          >
            +
          </button>
          <span className="px-2 py-1 text-xs bg-gray-800 text-white rounded text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.max(0.1, zoom * 0.9))}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
            title="Zoom Out (Ctrl + -)"
          >
            -
          </button>
          <button
            onClick={autoFitDiagram}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
            title="Auto Fit (Ctrl + 0)"
          >
            Fit
          </button>
        </div>
      )}

      {/* Instructions */}
      {mode === 'edit' && !readonly && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 p-2 rounded">
          {selectedTool === 'pan' || 'Ctrl+Drag: Pan • Ctrl+Scroll: Zoom • Click: Select • Double-click: Edit'}
        </div>
      )}
    </div>
  );
};
