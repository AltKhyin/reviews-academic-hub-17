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
  ReactFlowInstance // For project method
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ReviewBlock, DiagramContent, DiagramNode as DiagramNodeType, DiagramEdge as DiagramEdgeType, DiagramNodeData } from '@/types/review';
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

export const DiagramBlock: React.FC<DiagramBlockProps> = ({
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
      // Ensure nodes and edges are arrays and match DiagramNodeType/DiagramEdgeType
      nodes: Array.isArray(rawContent.nodes) ? rawContent.nodes : [],
      edges: Array.isArray(rawContent.edges) ? rawContent.edges : [],
    };
  }, [block.content]);

  // React Flow nodes and edges state
  const [rfNodes, setRfNodes] = useState<Node<DiagramNodeData>[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);

  const [title, setTitle] = useState(diagramContent.title || '');
  const [description, setDescription] = useState(diagramContent.description || '');
  const [canvasSettings, setCanvasSettings] = useState(diagramContent.canvas || getDefaultDiagramContent().canvas);
  
  const reactFlowInstance = useReactFlow<DiagramNodeData, DiagramEdgeType>(); // Typed useReactFlow

  // Transform persisted nodes/edges to React Flow compatible structure
  useEffect(() => {
    setRfNodes(diagramContent.nodes.map((n: DiagramNodeType): Node<DiagramNodeData> => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      type: 'custom', // Your custom node type
      data: n.data,   // Pass the data field
      width: n.width,
      height: n.height,
    })));
    setRfEdges(diagramContent.edges.map((e: DiagramEdgeType): Edge => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: e.type || 'floating', // Default to floating if type not specified
      data: e.data, // Pass data for FloatingEdge label
      // style: e.style, // If you have custom edge styles
    })));
    setTitle(diagramContent.title || '');
    setDescription(diagramContent.description || '');
    setCanvasSettings(diagramContent.canvas || getDefaultDiagramContent().canvas);
  }, [diagramContent]);


  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  const handleUpdateContent = useCallback(() => {
    if (onUpdate) {
      const updatedDiagramNodes: DiagramNodeType[] = rfNodes.map((n: Node<DiagramNodeData>): DiagramNodeType => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        width: n.data?.width || n.width || 150, // Use data if available, else node itself
        height: n.data?.height || n.height || 50,
        data: n.data, // Persist the whole data object
      }));
      const updatedDiagramEdges: DiagramEdgeType[] = rfEdges.map((e: Edge): DiagramEdgeType => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.data?.label === 'string' ? e.data.label : undefined,
          type: (e.type as DiagramEdgeType['type']) || 'curved', // Map back, default to curved
          data: e.data,
          // style: e.style,
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
  }, [rfNodes, rfEdges, title, description, canvasSettings, onUpdate]);

  useEffect(() => {
    if (readonly) return;
    const timer = setTimeout(() => {
      handleUpdateContent();
    }, 500);
    return () => clearTimeout(timer);
  }, [rfNodes, rfEdges, title, description, canvasSettings, readonly, handleUpdateContent]);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setRfNodes((nds) => applyNodeChanges(changes, nds)),
    [setRfNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setRfEdges((eds) => applyEdgeChanges(changes, eds)),
    [setRfEdges]
  );
  const onConnect = useCallback(
    (connection: Connection | Edge) => {
      setRfEdges((eds) => addEdge({ ...connection, type: 'floating', animated: true, data: { label: ''} }, eds))
    },
    [setRfEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = `node_${rfNodes.length + 1}_${Date.now()}`;
    const { x, y } = reactFlowInstance.project({ x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 });
    
    const newNodeData: DiagramNodeData = {
        label: `Novo Nó ${rfNodes.length + 1}`,
        type: 'rectangle',
        color: '#777',
        width: 150,
        height: 50
    };
    const newNode: Node<DiagramNodeData> = {
      id: newNodeId,
      type: 'custom',
      position: { x, y },
      data: newNodeData,
      width: newNodeData.width,
      height: newNodeData.height,
    };
    setRfNodes((nds) => nds.concat(newNode));
  }, [rfNodes, reactFlowInstance, setRfNodes]);

  const clearDiagram = useCallback(() => {
    setRfNodes([]);
    setRfEdges([]);
  }, [setRfNodes, setRfEdges]);

  const onDownloadImage = useCallback(() => {
    console.log("Download image functionality to be implemented.");
    const reactFlowDomNode = document.querySelector('.react-flow'); // Be more specific if possible
    if (reactFlowDomNode && (window as any).toPng) {
      (window as any).toPng(reactFlowDomNode, { backgroundColor: canvasSettings.backgroundColor })
        .then((dataUrl: string) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${title || 'diagram'}.png`;
          a.click();
        })
        .catch((err: any) => {
          console.error('Failed to download image:', err);
          alert('Erro ao baixar imagem. Verifique o console.');
        });
    } else {
      console.warn('Função toPng não disponível ou instância React Flow não encontrada.');
      alert('Funcionalidade de download não está pronta.');
    }
  }, [title, canvasSettings.backgroundColor]);


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
            <Background color="#444" gap={canvasSettings.gridSize} variant={BackgroundVariant.Dots} />
            <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node<DiagramNodeData>) => n.data?.color || '#fff'} />
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
          className="custom-diagram-flow"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? "#555" : 'transparent'}
            gap={canvasSettings.gridSize || 20}
            variant={canvasSettings.gridSize && canvasSettings.gridSize > 0 ? BackgroundVariant.Dots : undefined}
          />
          <Controls className="react-flow__controls-custom" />
          <MiniMap nodeStrokeWidth={3} nodeColor={(n: Node<DiagramNodeData>) => n.data?.color || '#fff'} className="react-flow__minimap-custom"/>
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
