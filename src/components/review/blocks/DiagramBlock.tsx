
// ABOUTME: Enhanced diagram block with react-flow, theming, and improved UX
// Provides interactive diagramming capabilities with persistence

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  MiniMap,
  useReactFlow,
  Panel,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'; // Changed from 'reactflow'
import '@xyflow/react/dist/style.css'; // Standard style import

import { ReviewBlock, DiagramContent, DiagramNode as DiagramNodeType, DiagramEdge as DiagramEdgeType } from '@/types/review';
import CustomNode from './diagram/CustomNode'; // Corrected import if CustomNode is default export
import FloatingEdge from './diagram/FloatingEdge'; // Corrected import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eraser, Download, Palette } from 'lucide-react'; // Maximize, Minimize removed as not used

const getDefaultDiagramContent = (): DiagramContent => ({
  nodes: [],
  edges: [],
  title: 'Novo Diagrama',
  description: '',
  canvas: { backgroundColor: '#1a1b26', gridSize: 20, zoom: 1, offsetX: 0, offsetY: 0 },
});

interface DiagramBlockProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({
  block,
  onUpdate,
  readonly = false,
}) => {
  const diagramContent = useMemo(() => {
    const rawContent = block.content || {};
    const defaultCanvas = getDefaultDiagramContent().canvas;
    return {
      ...getDefaultDiagramContent(),
      ...rawContent,
      canvas: {
        ...defaultCanvas,
        ...(rawContent.canvas || {}),
      },
      nodes: Array.isArray(rawContent.nodes) ? rawContent.nodes.map((n: DiagramNodeType): Node<DiagramNodeType['data']> => ({
        id: n.id || `node-${Math.random().toString(36).substr(2, 9)}`,
        position: { x: n.x, y: n.y },
        type: 'custom', 
        data: { 
            label: n.label, 
            type: n.type, // Original type like 'rectangle'
            color: n.color,
            width: n.width,
            height: n.height,
        },
        width: n.width,
        height: n.height,
      })) : [],
      edges: Array.isArray(rawContent.edges) ? rawContent.edges.map((e: DiagramEdgeType): Edge => ({
        id: e.id || `edge-${Math.random().toString(36).substr(2, 9)}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'floating', 
        data: { label: e.label }, // Pass label to data for FloatingEdge
        // style: e.style, // If you have custom edge styles
      })) : [],
    };
  }, [block.content]);

  const [nodes, setNodes] = useState<Node<DiagramNodeType['data']>[]>(diagramContent.nodes);
  const [edges, setEdges] = useState<Edge[]>(diagramContent.edges);
  const [title, setTitle] = useState(diagramContent.title || '');
  const [description, setDescription] = useState(diagramContent.description || '');
  const [canvasSettings, setCanvasSettings] = useState(diagramContent.canvas || getDefaultDiagramContent().canvas);
  
  const { project } = useReactFlow();

  useEffect(() => {
    setNodes(diagramContent.nodes);
    setEdges(diagramContent.edges);
    setTitle(diagramContent.title || '');
    setDescription(diagramContent.description || '');
    setCanvasSettings(diagramContent.canvas || getDefaultDiagramContent().canvas);
  }, [diagramContent]);

  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  const handleUpdateContent = useCallback(() => {
    if (onUpdate) {
      const updatedContent: DiagramContent = {
        nodes: nodes.map((n: Node<DiagramNodeType['data']>): DiagramNodeType => ({
          id: n.id,
          x: n.position.x,
          y: n.position.y,
          width: n.data?.width || n.width || 150,
          height: n.data?.height || n.height || 50,
          label: n.data?.label || '',
          type: n.data?.type || 'rectangle', 
          color: n.data?.color,
        })),
        edges: edges.map((e: Edge): DiagramEdgeType => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: typeof e.data?.label === 'string' ? e.data.label : undefined,
            type: (e.type === 'floating' || !e.type) ? 'curved' : e.type as DiagramEdgeType['type'], // Map back, default to curved
            // style: e.style,
        })),
        title,
        description,
        canvas: canvasSettings,
      };
      onUpdate({ content: updatedContent });
    }
  }, [nodes, edges, title, description, canvasSettings, onUpdate]);

  useEffect(() => {
    if (readonly) return;
    const timer = setTimeout(() => {
      handleUpdateContent();
    }, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges, title, description, canvasSettings, readonly, handleUpdateContent]);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...connection, type: 'floating', animated: true, data: { label: ''} }, eds))
    },
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = `node_${nodes.length + 1}_${Date.now()}`;
    const { x, y } = project({ x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 });
    const newNodeData: DiagramNodeType['data'] = {
        label: `Novo Nó ${nodes.length + 1}`,
        type: 'rectangle', // Default original type
        color: '#777',
        width: 150,
        height: 50
    };
    const newNode: Node<DiagramNodeType['data']> = {
      id: newNodeId,
      type: 'custom',
      position: { x, y },
      data: newNodeData,
      width: newNodeData.width,
      height: newNodeData.height,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, project, setNodes]);

  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const onDownloadImage = useCallback(() => {
    // This would require a library like html-to-image or react-flow's toPng utility
    console.log("Download image functionality to be implemented.");
    const reactFlowInstance = document.querySelector('.react-flow');
    if (reactFlowInstance && (window as any).toPng) { // toPng might not be readily available
        (window as any).toPng(reactFlowInstance, { backgroundColor: canvasSettings.backgroundColor })
        .then((dataUrl: string) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${title || 'diagram'}.png`;
          a.click();
        })
        .catch((err: any) => {
          console.error('Failed to download image:', err);
        });
    } else {
        console.warn('Image download function (toPng) not available or React Flow instance not found.');
    }
  }, [title, canvasSettings.backgroundColor]);


  if (readonly) {
    return (
      <div className="diagram-block readonly p-4 border rounded-md bg-gray-900 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
        <div style={{ width: '100%', height: 400, backgroundColor: canvasSettings.backgroundColor }} className="rounded overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#444" gap={canvasSettings.gridSize} variant={BackgroundVariant.Dots} />
            <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node<DiagramNodeType['data']>) => n.data?.color || '#fff'} />
          </ReactFlow>
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-block-editor p-2 space-y-3 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input 
          placeholder="Título do Diagrama" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-500"
        />
      </div>
      <Textarea 
        placeholder="Descrição (opcional)" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)}
        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 h-20 resize-none"
      />
      <div style={{ width: '100%', height: 500, border: '1px solid #333', borderRadius: '4px', backgroundColor: canvasSettings.backgroundColor }} className="relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="custom-diagram-flow"
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? "#555" : 'transparent'} 
            gap={canvasSettings.gridSize || 20} 
            variant={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? BackgroundVariant.Dots : undefined} 
          />
          <Controls className="react-flow__controls-custom" />
          <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node<DiagramNodeType['data']>) => n.data?.color || '#fff'} className="react-flow__minimap-custom"/>
          <Panel position="top-left" className="flex gap-1 p-1 bg-gray-800/50 rounded">
            <Button onClick={addNode} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700"><Palette size={16} className="mr-1" /> Adicionar Nó</Button>
            <Button onClick={clearDiagram} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/30"><Eraser size={16} className="mr-1" /> Limpar</Button>
            <Button onClick={onDownloadImage} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"><Download size={16} className="mr-1" /> Baixar</Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
