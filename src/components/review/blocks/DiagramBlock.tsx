// ABOUTME: Interactive diagram maker block for scientific illustrations
// Supports flowcharts, decision trees, process diagrams with drag-and-drop editing

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReviewBlock } from '@/types/review';
import { DiagramCanvas } from './diagram/DiagramCanvas';
import { DiagramToolbar } from './diagram/DiagramToolbar';
import { DiagramTemplateSelector } from './diagram/DiagramTemplateSelector';
import { DiagramExporter } from './diagram/DiagramExporter';
import { DiagramContent, DiagramNode, DiagramConnection } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit3, 
  Eye, 
  Download, 
  FileText,
  Settings,
  Grid3X3,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramBlockProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({
  block,
  onUpdate,
  readonly = false
}) => {
  const content = block.content as DiagramContent;
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize default content if empty
  const defaultContent: DiagramContent = {
    title: 'Novo Diagrama',
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      gridEnabled: true,
      gridSize: 20,
      gridColor: '#e5e7eb',
      snapToGrid: true
    },
    nodes: [],
    connections: [],
    exportSettings: {
      format: 'svg',
      quality: 1,
      transparentBackground: false
    },
    accessibility: {
      altText: 'Diagrama científico interativo'
    }
  };

  const diagramContent = content || defaultContent;

  const handleContentUpdate = useCallback((updates: Partial<DiagramContent>) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...diagramContent,
          ...updates
        }
      });
    }
  }, [diagramContent, onUpdate]);

  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: DiagramNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType as any,
      position,
      size: { width: 120, height: 60 },
      text: 'Novo Item',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'center',
        opacity: 1
      }
    };

    handleContentUpdate({
      nodes: [...diagramContent.nodes, newNode]
    });
  }, [diagramContent.nodes, handleContentUpdate]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<DiagramNode>) => {
    const updatedNodes = diagramContent.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    handleContentUpdate({ nodes: updatedNodes });
  }, [diagramContent.nodes, handleContentUpdate]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const updatedNodes = diagramContent.nodes.filter(node => node.id !== nodeId);
    const updatedConnections = diagramContent.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    
    handleContentUpdate({
      nodes: updatedNodes,
      connections: updatedConnections
    });
  }, [diagramContent.nodes, diagramContent.connections, handleContentUpdate]);

  const handleConnectionAdd = useCallback((connection: DiagramConnection) => {
    handleContentUpdate({
      connections: [...diagramContent.connections, connection]
    });
  }, [diagramContent.connections, handleContentUpdate]);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    const updatedConnections = diagramContent.connections.filter(
      conn => conn.id !== connectionId
    );
    
    handleContentUpdate({ connections: updatedConnections });
  }, [diagramContent.connections, handleContentUpdate]);

  const handleCanvasUpdate = useCallback((canvasUpdates: Partial<DiagramContent['canvas']>) => {
    handleContentUpdate({
      canvas: {
        ...diagramContent.canvas,
        ...canvasUpdates
      }
    });
  }, [diagramContent.canvas, handleContentUpdate]);

  const handleTemplateApply = useCallback((templateNodes: DiagramNode[], templateConnections: DiagramConnection[]) => {
    handleContentUpdate({
      nodes: templateNodes,
      connections: templateConnections
    });
    setShowTemplates(false);
  }, [handleContentUpdate]);

  if (readonly) {
    return (
      <Card className="diagram-block-readonly" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
            {diagramContent.title}
          </h3>
          <DiagramCanvas
            content={diagramContent}
            mode="preview"
            selectedTool="select"
            selectedNodes={[]}
            onNodeAdd={() => {}}
            onNodeUpdate={() => {}}
            onNodeDelete={() => {}}
            onConnectionAdd={() => {}}
            onConnectionDelete={() => {}}
            onSelectionChange={() => {}}
            readonly={true}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="diagram-block" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" style={{ color: '#3b82f6' }} />
            <input
              type="text"
              value={diagramContent.title}
              onChange={(e) => handleContentUpdate({ title: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none outline-none"
              style={{ color: '#ffffff' }}
              placeholder="Título do diagrama"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="text-gray-400 hover:text-white"
            >
              <FileText className="w-4 h-4 mr-1" />
              Modelos
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExporter(true)}
              className="text-gray-400 hover:text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
            
            <div className="flex border rounded-md" style={{ borderColor: '#2a2a2a' }}>
              <Button
                variant={mode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('edit')}
                className="rounded-r-none"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant={mode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('preview')}
                className="rounded-l-none"
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        {mode === 'edit' && (
          <div className="mb-4">
            <textarea
              value={diagramContent.description || ''}
              onChange={(e) => handleContentUpdate({ description: e.target.value })}
              placeholder="Descrição do diagrama (opcional)"
              className="w-full p-2 text-sm bg-transparent border rounded resize-none"
              style={{ 
                borderColor: '#2a2a2a', 
                color: '#d1d5db',
                minHeight: '60px'
              }}
            />
          </div>
        )}

        {/* Toolbar */}
        {mode === 'edit' && (
          <div className="mb-4">
            <DiagramToolbar
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              canvas={diagramContent.canvas}
              onCanvasUpdate={handleCanvasUpdate}
              selectedNodes={selectedNodes}
              onNodesUpdate={(nodes) => {
                const updatedNodes = diagramContent.nodes.map(node => {
                  const updated = nodes.find(n => n.id === node.id);
                  return updated || node;
                });
                handleContentUpdate({ nodes: updatedNodes });
              }}
            />
          </div>
        )}

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: '#2a2a2a' }}
        >
          <DiagramCanvas
            content={diagramContent}
            mode={mode}
            selectedTool={selectedTool}
            selectedNodes={selectedNodes}
            onNodeAdd={handleNodeAdd}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onConnectionAdd={handleConnectionAdd}
            onConnectionDelete={handleConnectionDelete}
            onSelectionChange={setSelectedNodes}
            readonly={readonly}
          />
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <DiagramTemplateSelector
            onTemplateSelect={handleTemplateApply}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {/* Export Modal */}
        {showExporter && (
          <DiagramExporter
            content={diagramContent}
            onClose={() => setShowExporter(false)}
          />
        )}
      </div>
    </Card>
  );
};
