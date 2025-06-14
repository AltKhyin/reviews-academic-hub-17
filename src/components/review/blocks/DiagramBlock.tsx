// ABOUTME: Diagram block component for creating and displaying visual diagrams.
// Supports nodes, edges, and interactive canvas for review content.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';
import { DiagramContent, DiagramNode, DiagramEdge, ReviewBlock } from '@/types/review';
import { Trash2, Edit3, PlusCircle, Save, Palette, Settings2, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock or simple implementation of a diagramming library interface
// In a real scenario, you'd use a library like React Flow, Excalidraw, etc.

interface DiagramCanvasProps {
  content: DiagramContent;
  onContentChange: (newContent: DiagramContent) => void;
  readOnly?: boolean;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ content, onContentChange, readOnly }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeUpdate = (nodeId: string, updates: Partial<DiagramNode>) => {
    onContentChange({
      ...content,
      nodes: content.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
    });
  };
  
  const { nodes = [], edges = [], canvas = {} } = content; 

  return (
    <div 
      className="relative w-full h-[400px] border rounded-md overflow-hidden" 
      style={{ backgroundColor: canvas.backgroundColor || '#f0f0f0' }}
    >
      {edges.map(edge => (
        <svg key={edge.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {(() => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            
            const sourceX = (sourceNode.x ?? sourceNode.position?.x ?? 0) + (sourceNode.width ?? sourceNode.size?.width ?? 0) / 2;
            const sourceY = (sourceNode.y ?? sourceNode.position?.y ?? 0) + (sourceNode.height ?? sourceNode.size?.height ?? 0) / 2;
            const targetX = (targetNode.x ?? targetNode.position?.x ?? 0) + (targetNode.width ?? targetNode.size?.width ?? 0) / 2;
            const targetY = (targetNode.y ?? targetNode.position?.y ?? 0) + (targetNode.height ?? targetNode.size?.height ?? 0) / 2;

            return (
              <line 
                x1={sourceX} y1={sourceY} 
                x2={targetX} y2={targetY} 
                stroke={edge.style?.strokeColor || "black"} 
                strokeWidth={edge.style?.strokeWidth || 2} 
              />
            );
          })()}
        </svg>
      ))}

      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute p-2 border cursor-grab"
          style={{
            left: `${node.x ?? node.position?.x ?? 0}px`,
            top: `${node.y ?? node.position?.y ?? 0}px`,
            width: `${node.width ?? node.size?.width ?? 100}px`,
            height: `${node.height ?? node.size?.height ?? 50}px`,
            backgroundColor: node.color || node.style?.backgroundColor || 'white',
            borderColor: node.style?.borderColor || 'black',
            color: node.style?.textColor || 'black',
            borderRadius: node.type === 'circle' ? '50%' : (node.type === 'diamond' ? '0' : '4px'),
            transform: node.type === 'diamond' ? 'rotate(45deg)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: node.style?.textAlign || 'center',
            fontSize: `${node.style?.fontSize || 14}px`,
            opacity: node.style?.opacity || 1,
          }}
          onClick={() => !readOnly && setSelectedNodeId(node.id)}
        >
          <div style={{ transform: node.type === 'diamond' ? 'rotate(-45deg)' : 'none' }}>
            {node.label || node.text || `Node ${node.id}`}
          </div>
        </div>
      ))}

      {selectedNodeId && !readOnly && (
        <div className="absolute top-2 right-2 bg-white p-2 border rounded shadow-lg w-64 z-10">
          <Label>Edit Node: {selectedNodeId}</Label>
          <Input 
            value={nodes.find(n=>n.id===selectedNodeId)?.label || ''} 
            onChange={(e) => handleNodeUpdate(selectedNodeId, { label: e.target.value })}
            className="mt-1"
          />
          <Button size="sm" variant="outline" onClick={() => setSelectedNodeId(null)} className="mt-2">Close</Button>
        </div>
      )}
    </div>
  );
};


interface DiagramBlockProps {
  block: ReviewBlock; // ReviewBlock already has string ID
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  isActive: boolean;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({ block, onUpdateBlock, onDeleteBlock, isActive }) => {
  const content = (block.content || { nodes: [], edges: [], canvas: {} }) as DiagramContent;

  const handleContentChange = (newContent: Partial<DiagramContent>) => {
    onUpdateBlock(block.id, { content: { ...content, ...newContent } });
  };

  const addNode = () => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: 'rectangle',
      x: 50, y: 50, width: 120, height: 60,
      label: 'New Node',
      color: '#ffffff', // Default color
      // Ensure all required fields for DiagramNode are present
      style: { backgroundColor: '#ffffff', borderColor: '#000000', textColor: '#000000' },
      position: { x: 50, y: 50}, // if x,y are optional
      size: {width: 120, height: 60} // if width, height are optional
    };
    handleContentChange({ nodes: [...(content.nodes || []), newNode] });
  };

  const addEdge = () => {
    if ((content.nodes || []).length < 2) {
      alert("Need at least two nodes to create an edge.");
      return;
    }
    const newEdge: DiagramEdge = {
      id: `edge-${Date.now()}`,
      source: content.nodes[0].id,
      target: content.nodes[content.nodes.length - 1].id,
      type: 'straight',
      style: { strokeColor: '#000000', strokeWidth: 2 }
    };
    handleContentChange({ edges: [...(content.edges || []), newEdge] });
  };
  
  const handleCanvasSettingsChange = (updates: Partial<DiagramContent['canvas']>) => {
    handleContentChange({ canvas: { ...(content.canvas || {}), ...updates } });
  };

  return (
    <Card className={cn("diagram-block", isActive && "ring-2 ring-blue-500")}>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3 bg-gray-800/50 border-b border-gray-700">
        <CardTitle className="text-base font-medium text-gray-200">Diagram Block</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={addNode} title="Add Node">
            <PlusCircle className="w-4 h-4 text-green-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={addEdge} title="Add Edge" disabled={(content.nodes || []).length < 2}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-fork text-blue-400"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDeleteBlock(block.id)} title="Delete Block">
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 space-y-2 bg-gray-900/30">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <Label htmlFor={`diagram-title-${block.id}`} className="text-xs text-gray-400">Title</Label>
            <Input
              id={`diagram-title-${block.id}`}
              value={content.title || ''}
              onChange={(e) => handleContentChange({ title: e.target.value })}
              placeholder="Diagram Title"
              className="text-sm bg-gray-800 border-gray-700 text-white focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor={`diagram-bg-${block.id}`} className="text-xs text-gray-400">Canvas BG</Label>
            <Input
              id={`diagram-bg-${block.id}`}
              type="color"
              value={content.canvas?.backgroundColor || '#f0f0f0'}
              onChange={(e) => handleCanvasSettingsChange({ backgroundColor: e.target.value })}
              className="w-full h-9 p-1 bg-gray-800 border-gray-700"
            />
          </div>
        </div>
        <DiagramCanvas content={content} onContentChange={(newDiagramContent) => handleContentChange(newDiagramContent)} />
      </CardContent>
    </Card>
  );
};
