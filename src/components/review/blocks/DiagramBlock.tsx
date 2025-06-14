
// ABOUTME: Enhanced diagram block with react-flow, theming, and improved UX
// Provides interactive diagramming capabilities with persistence

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
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
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ReviewBlock, DiagramContent, DiagramNode as DiagramNodeType, DiagramEdge as DiagramEdgeType } from '@/types/review'; // Ensure types are imported
import { CustomNode } from './diagram/CustomNode';
import { FloatingEdge } from './diagram/FloatingEdge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eraser, Download, Palette, Maximize, Minimize } from 'lucide-react';
// Ensure react-colorful is installed and imported if used
// import { HexColorPicker } from 'react-colorful'; // Example import

// Default content if block.content is empty or malformed
const getDefaultDiagramContent = (): DiagramContent => ({
  nodes: [],
  edges: [],
  title: 'Novo Diagrama',
  description: '',
  canvas: { backgroundColor: '#1a1b26', gridSize: 20, zoom: 1, offsetX:0, offsetY:0 },
});

interface DiagramBlockProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  onInteraction?: (interactionType: string, data?: any) => void;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({
  block,
  onUpdate,
  readonly = false,
  // onInteraction // Not used directly in this component
}) => {
  const diagramContent = useMemo(() => {
    // Ensure content and canvas exist and have defaults
    const rawContent = block.content || {};
    return {
      ...getDefaultDiagramContent(),
      ...rawContent,
      canvas: {
        ...(getDefaultDiagramContent().canvas),
        ...(rawContent.canvas || {})
      },
      // Ensure nodes and edges are arrays
      nodes: Array.isArray(rawContent.nodes) ? rawContent.nodes.map(n => ({ // Map to ensure correct type
        id: n.id || `node-${Math.random()}`,
        position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        type: n.type || 'custom', // Default to custom node type
        data: n.data || { label: n.label || 'Novo Nó' }, // Map label to data.label
        // Map other properties from DiagramNodeType if they exist on 'n'
        width: n.width, 
        height: n.height,
        // label: n.label, // Redundant if data.label is used
        // color: n.color, // If DiagramNodeType has color
      })) as Node<any>[] : [], // Cast to ReactFlow Node type
      edges: Array.isArray(rawContent.edges) ? rawContent.edges.map(e => ({ // Map to ensure correct type
        id: e.id || `edge-${Math.random()}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: e.type || 'floating', // Default to floating edge type
        // style: e.style, // If DiagramEdgeType has style
      })) as Edge[] : [], // Cast to ReactFlow Edge type
    };
  }, [block.content]);

  const [nodes, setNodes] = useState<Node[]>(diagramContent.nodes as Node[]);
  const [edges, setEdges] = useState<Edge[]>(diagramContent.edges as Edge[]);
  const [title, setTitle] = useState(diagramContent.title || '');
  const [description, setDescription] = useState(diagramContent.description || '');
  const [canvasSettings, setCanvasSettings] = useState(diagramContent.canvas || getDefaultDiagramContent().canvas);
  
  const { project } = useReactFlow();

  useEffect(() => {
    setNodes(diagramContent.nodes as Node[]);
    setEdges(diagramContent.edges as Edge[]);
    setTitle(diagramContent.title || '');
    setDescription(diagramContent.description || '');
    setCanvasSettings(diagramContent.canvas || getDefaultDiagramContent().canvas);
  }, [diagramContent]);

  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  const handleUpdateContent = useCallback(() => {
    if (onUpdate) {
      const updatedContent: DiagramContent = {
        nodes: nodes.map(n => ({ // Map back to DiagramNodeType
          id: n.id,
          x: n.position.x,
          y: n.position.y,
          width: n.width || 150, // Default width
          height: n.height || 50, // Default height
          label: n.data.label || '',
          type: n.type === 'custom' ? 'rectangle' : (n.type as 'rectangle' | 'circle' | 'diamond') || 'rectangle', // Map custom type back
          color: n.data.color, // Assuming CustomNode data has color
        })),
        edges: edges.map(e => ({ // Map back to DiagramEdgeType
            id: e.id,
            source: e.source,
            target: e.target,
            label: typeof e.label === 'string' ? e.label : undefined,
            type: e.type === 'floating' ? 'curved' : (e.type as 'straight' | 'curved' | 'step') || 'curved', // Map custom type back
        })),
        title,
        description,
        canvas: canvasSettings,
      };
      onUpdate({ content: updatedContent });
    }
  }, [nodes, edges, title, description, canvasSettings, onUpdate]);

  // Debounced update
  useEffect(() => {
    if (readonly) return;
    const timer = setTimeout(() => {
      handleUpdateContent();
    }, 500); // Debounce updates
    return () => clearTimeout(timer);
  }, [nodes, edges, title, description, canvasSettings, readonly, handleUpdateContent]);


  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...connection, type: 'floating', animated: true }, eds))
    },
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = `node_${nodes.length + 1}_${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position: project({ x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 }),
      data: { label: `Novo Nó ${nodes.length + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, project, setNodes]);

  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    // Optionally reset title, description, canvas settings
  }, [setNodes, setEdges]);

  const onDownloadImage = useCallback(() => {
    // Requires toPng or similar from react-flow or a library like html-to-image
    console.log("Download image functionality to be implemented.");
  }, []);


  if (readonly) {
    // Simplified readonly view
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
          >
            <Background color="#444" gap={canvasSettings.gridSize} variant={BackgroundVariant.Dots} />
            <MiniMap nodeStrokeWidth={3} nodeColor={(n) => n.data.color || '#fff'} />
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
         {/* Button to toggle fullscreen or advanced settings panel if needed */}
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
          <MiniMap nodeStrokeWidth={3} nodeColor={(n) => n.data.color || '#fff'} className="react-flow__minimap-custom"/>
          <Panel position="top-left" className="flex gap-1 p-1 bg-gray-800/50 rounded">
            <Button onClick={addNode} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700"><Palette size={16} className="mr-1" /> Adicionar Nó</Button>
            <Button onClick={clearDiagram} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/30"><Eraser size={16} className="mr-1" /> Limpar</Button>
            <Button onClick={onDownloadImage} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"><Download size={16} className="mr-1" /> Baixar</Button>
          </Panel>
        </ReactFlow>
      </div>
       {/* Advanced settings for canvas, colors etc. could go here */}
    </div>
  );
};

// Ensure this is outside the DiagramBlock component if it's a standalone component.
// For now, assuming it's part of the diagram system.
// This is a simplified example of what a color picker integration might look like.
// const ColorPickerPanel = ({ color, onChange }) => (
//   <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
//     <HexColorPicker color={color} onChange={onChange} />
//   </div>
// );

