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
  XYPosition,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ReviewBlock, DiagramContent, DiagramNode as DiagramNodeType, DiagramEdge as DiagramEdgeType, DiagramNodeData, DiagramEdgeData } from '@/types/review';
import CustomNode from './diagram/CustomNode';
import FloatingEdge from './diagram/FloatingEdge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eraser, Download, Palette } from 'lucide-react';

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

const DiagramBlockInternal: React.FC<DiagramBlockProps> = ({ 
  block,
  onUpdate,
  readonly = false,
}) => {
  const diagramContent = useMemo((): DiagramContent => {
    const rawContent = block.content || {};
    const defaultCanvas = getDefaultDiagramContent().canvas;
    return {
      ...getDefaultDiagramContent(),
      ...rawContent,
      canvas: {
        ...defaultCanvas,
        ...(rawContent.canvas || {}),
      },
      nodes: Array.isArray(rawContent.nodes) ? rawContent.nodes : [],
      edges: Array.isArray(rawContent.edges) ? rawContent.edges : [],
    };
  }, [block.content]);

  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]); 

  const [title, setTitle] = useState(diagramContent.title || '');
  const [description, setDescription] = useState(diagramContent.description || '');
  const [canvasSettings, setCanvasSettings] = useState(diagramContent.canvas || getDefaultDiagramContent().canvas);
  
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    setRfNodes(diagramContent.nodes.map((n: DiagramNodeType): Node<DiagramNodeData> => ({
      id: n.id,
      position: n.position,
      type: 'custom', 
      data: n.data,
      width: n.width,
      height: n.height,
    })));
    setRfEdges(diagramContent.edges.map((e: DiagramEdgeType): Edge<DiagramEdgeData> => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: e.type || 'floating',
      data: e.data, 
      style: e.style,
      animated: e.animated,
    })));
    setTitle(diagramContent.title || '');
    setDescription(diagramContent.description || '');
    setCanvasSettings(diagramContent.canvas || getDefaultDiagramContent().canvas);
  }, [diagramContent]);

  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);


  const handleUpdateContent = useCallback(() => {
    if (onUpdate && reactFlowInstance) {
      const updatedDiagramNodes: DiagramNodeType[] = reactFlowInstance.getNodes().map((n): DiagramNodeType => ({
        id: n.id,
        position: n.position,
        width: n.width || (n.data as DiagramNodeData)?.width || 150, 
        height: n.height || (n.data as DiagramNodeData)?.height || 50,
        data: n.data as DiagramNodeData,
      }));
      const updatedDiagramEdges: DiagramEdgeType[] = reactFlowInstance.getEdges().map((e): DiagramEdgeType => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.label === 'string' ? e.label : (e.data as DiagramEdgeData)?.label,
          type: (e.type as DiagramEdgeType['type']) || 'floating',
          data: e.data as DiagramEdgeData,
          style: e.style,
          animated: e.animated,
      }));
      
      const updatedContent: DiagramContent = {
        nodes: updatedDiagramNodes,
        edges: updatedDiagramEdges,
        title,
        description,
        canvas: canvasSettings,
      };
      onUpdate({ content: updatedContent });
    }
  }, [title, description, canvasSettings, onUpdate, reactFlowInstance]);

  useEffect(() => {
    if (readonly) return;
    const timer = setTimeout(() => {
      handleUpdateContent();
    }, 500);
    return () => clearTimeout(timer);
  }, [rfNodes, rfEdges, title, description, canvasSettings, readonly, handleUpdateContent]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setRfNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setRfEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        ...connection,
        type: 'floating',
        animated: true,
        data: { label: '' },
      };
      setRfEdges((eds) => addEdge(newEdge, eds));
    },
    [setRfEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = `node_${rfNodes.length + 1}_${Date.now()}`;
    
    // Default position if reactFlowInstance isn't ready
    let position: XYPosition = { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 }; 
    
    // The `project` method is deprecated. This is a robust way to add nodes in the current view.
    if (reactFlowInstance) {
        const pane = reactFlowInstance.getViewport();
        position = {
            x: (Math.random() * 400 - 200) - (pane.x / pane.zoom),
            y: (Math.random() * 200 - 100) - (pane.y / pane.zoom),
        };
    }

    const newNodeData: DiagramNodeData = {
        label: `Novo Nó ${rfNodes.length + 1}`,
        type: 'rectangle',
        color: '#777',
        width: 150,
        height: 50
    };
    const newNode: Node<DiagramNodeData> = {
      id: newNodeId,
      type: 'custom', // Ensure this matches a key in your nodeTypes
      position,
      data: newNodeData,
      width: newNodeData.width, // Optional: CustomNode might set its own size based on data
      height: newNodeData.height,
    };
    setRfNodes((nds) => nds.concat(newNode));
  }, [rfNodes, reactFlowInstance]);

  const clearDiagram = useCallback(() => {
    setRfNodes([]);
    setRfEdges([]);
  }, [setRfNodes, setRfEdges]);

  const onDownloadImage = useCallback(() => {
    console.log("Download image functionality to be implemented.");
    // Implementation using toPng or html-to-image
  }, []); 


  if (readonly) {
    return (
      <div className="diagram-block readonly p-4 border rounded-md bg-gray-900 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
        <div style={{ width: '100%', height: 400, backgroundColor: canvasSettings.backgroundColor }} className="rounded overflow-hidden">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
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
            <Background color="#444" gap={canvasSettings.gridSize || 20} variant={BackgroundVariant.Dots} />
            <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node) => (n.data as DiagramNodeData)?.color || '#fff'} />
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
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="custom-diagram-flow" // For potential global styling
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? "#555" : 'transparent'}
            gap={canvasSettings.gridSize || 20}
            variant={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? BackgroundVariant.Dots : undefined}
          />
          <Controls className="react-flow__controls-custom" />
          <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node) => (n.data as DiagramNodeData)?.color || '#fff'} className="react-flow__minimap-custom"/>
          <Panel position="top-left" className="flex gap-1 p-1 bg-gray-800/50 rounded shadow-lg">
            <Button onClick={addNode} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700"><Palette size={16} className="mr-1" /> Adicionar Nó</Button>
            <Button onClick={clearDiagram} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/30"><Eraser size={16} className="mr-1" /> Limpar</Button>
            <Button onClick={onDownloadImage} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"><Download size={16} className="mr-1" /> Baixar</Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export const DiagramBlock: React.FC<DiagramBlockProps> = (props) => (
  <ReactFlowProvider>
    <DiagramBlockInternal {...props} />
  </ReactFlowProvider>
);
