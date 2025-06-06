
// ABOUTME: Enhanced SVG-based diagram canvas with improved text handling and responsive design
// Supports node manipulation, connections, and fullscreen editing without drag conflicts

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { DiagramContent, DiagramNode, DiagramConnection } from '@/types/review';
import { DiagramNodeComponent } from './DiagramNodeComponent';
import { DiagramConnectionComponent } from './DiagramConnectionComponent';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  // Safe canvas access with fallback defaults
  const canvas = content?.canvas || {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    gridEnabled: true,
    gridSize: 20,
    gridColor: '#e5e7eb',
    snapToGrid: true
  };

  // Safe access to nodes and connections with fallbacks
  const nodes = content?.nodes || [];
  const connections = content?.connections || [];

  // Update viewBox when content canvas changes
  useEffect(() => {
    if (canvas) {
      setViewBox({
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
      });
    }
  }, [canvas]);

  // Auto-fit content to available space in fullscreen
  useEffect(() => {
    if (mode === 'edit' && containerRef.current) {
      const container = containerRef.current;
      const resizeObserver = new ResizeObserver(() => {
        if (nodes.length > 0) {
          fitContentToView();
        }
      });
      
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, [mode, nodes]);

  const fitContentToView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    });
    
    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate scale to fit content
    const scaleX = containerRect.width / contentWidth;
    const scaleY = containerRect.height / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
    
    const scaledWidth = containerRect.width / scale;
    const scaledHeight = containerRect.height / scale;
    
    // Center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    setViewBox({
      x: centerX - scaledWidth / 2,
      y: centerY - scaledHeight / 2,
      width: scaledWidth,
      height: scaledHeight
    });
  }, [nodes]);

  const getMousePosition = useCallback((event: React.MouseEvent): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    return {
      x: viewBox.x + (event.clientX - rect.left) * scaleX,
      y: viewBox.y + (event.clientY - rect.top) * scaleY
    };
  }, [viewBox]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (readonly || isPanning) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const position = getMousePosition(event);
    
    // Clear selection when clicking on empty canvas
    if (selectedTool === 'select') {
      onSelectionChange([]);
      return;
    }
    
    // Add new node
    if (selectedTool !== 'select' && selectedTool !== 'connect') {
      onNodeAdd(selectedTool, position);
    }
  }, [readonly, isPanning, selectedTool, getMousePosition, onSelectionChange, onNodeAdd]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only allow panning with Ctrl+click or middle mouse button to avoid conflicts
    if (event.ctrlKey || event.button === 1) {
      event.preventDefault();
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning && panStart) {
      event.preventDefault();
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;
        
        setViewBox(prev => ({
          ...prev,
          x: prev.x - deltaX * scaleX,
          y: prev.y - deltaY * scaleY
        }));
        
        setPanStart({ x: event.clientX, y: event.clientY });
      }
    }
  }, [isPanning, panStart, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (readonly) return;
    
    // Always select the node when clicked, regardless of tool
    const isCurrentlySelected = selectedNodes.includes(nodeId);
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      if (isCurrentlySelected) {
        onSelectionChange(selectedNodes.filter(id => id !== nodeId));
      } else {
        onSelectionChange([...selectedNodes, nodeId]);
      }
    } else {
      // Single select
      onSelectionChange([nodeId]);
    }
    
    // Handle connection tool
    if (selectedTool === 'connect') {
      if (!isConnecting) {
        setIsConnecting(true);
        setConnectionStart(nodeId);
      } else if (connectionStart && connectionStart !== nodeId) {
        // Create connection
        const newConnection: DiagramConnection = {
          id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sourceNodeId: connectionStart,
          targetNodeId: nodeId,
          sourcePoint: 'right',
          targetPoint: 'left',
          style: {
            strokeColor: '#3b82f6',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: false,
            opacity: 1
          }
        };
        
        onConnectionAdd(newConnection);
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }
  }, [readonly, selectedNodes, selectedTool, isConnecting, connectionStart, onSelectionChange, onConnectionAdd]);

  const handleNodeDuplicate = useCallback((nodeId: string, direction: 'top' | 'right' | 'bottom' | 'left') => {
    const sourceNode = nodes.find(node => node.id === nodeId);
    if (!sourceNode) return;
    
    // Calculate new position based on direction
    const spacing = 150;
    let newPosition = { ...sourceNode.position };
    
    switch (direction) {
      case 'top':
        newPosition.y -= spacing;
        break;
      case 'right':
        newPosition.x += spacing;
        break;
      case 'bottom':
        newPosition.y += spacing;
        break;
      case 'left':
        newPosition.x -= spacing;
        break;
    }
    
    // Create duplicate node
    const newNode: DiagramNode = {
      ...sourceNode,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: newPosition,
      text: sourceNode.text + ' (Cópia)'
    };
    
    onNodeUpdate('temp', newNode);
    
    // Create connection between original and duplicate
    const newConnection: DiagramConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: nodeId,
      targetNodeId: newNode.id,
      sourcePoint: direction,
      targetPoint: direction === 'top' ? 'bottom' : direction === 'bottom' ? 'top' : direction === 'left' ? 'right' : 'left',
      style: {
        strokeColor: '#6b7280',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowType: 'arrow',
        curved: false,
        opacity: 1
      }
    };
    
    setTimeout(() => {
      onConnectionAdd(newConnection);
    }, 100);
  }, [nodes, onNodeUpdate, onConnectionAdd]);

  // Function to calculate connection points based on node positions and connection points
  const getConnectionPoint = useCallback((node: DiagramNode, point: string) => {
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
      default:
        return { x: position.x + size.width / 2, y: position.y + size.height / 2 };
    }
  }, []);

  // Render grid
  const renderGrid = () => {
    if (!canvas.gridEnabled) return null;
    
    const { gridSize, gridColor } = canvas;
    const lines = [];
    
    // Vertical lines
    for (let x = Math.floor(viewBox.x / gridSize) * gridSize; x < viewBox.x + viewBox.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={viewBox.y}
          x2={x}
          y2={viewBox.y + viewBox.height}
          stroke={gridColor}
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }
    
    // Horizontal lines
    for (let y = Math.floor(viewBox.y / gridSize) * gridSize; y < viewBox.y + viewBox.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={viewBox.x}
          y1={y}
          x2={viewBox.x + viewBox.width}
          y2={y}
          stroke={gridColor}
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }
    
    return <g className="grid">{lines}</g>;
  };

  return (
    <div 
      ref={containerRef}
      className="diagram-canvas w-full h-full relative overflow-hidden"
      style={{ 
        backgroundColor: canvas.backgroundColor || 'transparent',
        cursor: isPanning ? 'grabbing' : selectedTool === 'select' ? 'default' : 'crosshair'
      }}
    >
      <svg
        ref={canvasRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ 
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        {/* Grid */}
        {renderGrid()}
        
        {/* Connections */}
        {connections.map(connection => {
          const sourceNode = nodes.find(node => node.id === connection.sourceNodeId);
          const targetNode = nodes.find(node => node.id === connection.targetNodeId);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourcePoint = getConnectionPoint(sourceNode, connection.sourcePoint);
          const targetPoint = getConnectionPoint(targetNode, connection.targetPoint);
          
          return (
            <DiagramConnectionComponent
              key={connection.id}
              connection={connection}
              sourcePoint={sourcePoint}
              targetPoint={targetPoint}
              onDelete={() => onConnectionDelete(connection.id)}
              readonly={readonly}
            />
          );
        })}
        
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
            readonly={readonly}
            snapToGrid={canvas.snapToGrid}
            gridSize={canvas.gridSize}
          />
        ))}
      </svg>
      
      {/* Instructions overlay for fullscreen */}
      {mode === 'edit' && !readonly && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
          <div className="hidden sm:block">
            Ctrl + Arrastar: Pan • Clique: Selecionar • Duplo-clique: Editar
          </div>
          <div className="sm:hidden">
            Toque: Selecionar • Duplo-toque: Editar
          </div>
        </div>
      )}
    </div>
  );
};
