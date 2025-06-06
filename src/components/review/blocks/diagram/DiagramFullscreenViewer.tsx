
// ABOUTME: Fullscreen viewer for diagram editing with immersive experience
// Provides dedicated workspace for complex diagram creation

import React, { useCallback, useEffect } from 'react';
import { DiagramContent, DiagramNode, DiagramConnection } from '@/types/review';
import { DiagramCanvas } from './DiagramCanvas';
import { DiagramToolbar } from './DiagramToolbar';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramFullscreenViewerProps {
  content: DiagramContent;
  selectedTool: string;
  selectedNodes: string[];
  onContentUpdate: (updates: Partial<DiagramContent>) => void;
  onToolChange: (tool: string) => void;
  onSelectionChange: (nodeIds: string[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export const DiagramFullscreenViewer: React.FC<DiagramFullscreenViewerProps> = ({
  content,
  selectedTool,
  selectedNodes,
  onContentUpdate,
  onToolChange,
  onSelectionChange,
  onClose,
  onSave
}) => {
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

    onContentUpdate({
      nodes: [...content.nodes, newNode]
    });
  }, [content.nodes, onContentUpdate]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<DiagramNode>) => {
    const updatedNodes = content.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    onContentUpdate({ nodes: updatedNodes });
  }, [content.nodes, onContentUpdate]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const updatedNodes = content.nodes.filter(node => node.id !== nodeId);
    const updatedConnections = content.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    
    onContentUpdate({
      nodes: updatedNodes,
      connections: updatedConnections
    });
  }, [content.nodes, content.connections, onContentUpdate]);

  const handleConnectionAdd = useCallback((connection: DiagramConnection) => {
    onContentUpdate({
      connections: [...content.connections, connection]
    });
  }, [content.connections, onContentUpdate]);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    const updatedConnections = content.connections.filter(
      conn => conn.id !== connectionId
    );
    
    onContentUpdate({ connections: updatedConnections });
  }, [content.connections, onContentUpdate]);

  const handleCanvasUpdate = useCallback((canvasUpdates: Partial<DiagramContent['canvas']>) => {
    onContentUpdate({
      canvas: {
        ...content.canvas,
        ...canvasUpdates
      }
    });
  }, [content.canvas, onContentUpdate]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSave]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background"
      style={{ backgroundColor: '#121212' }}
    >
      {/* Header */}
      <div 
        className="h-14 border-b flex items-center justify-between px-4"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            {content.title} - Editor Fullscreen
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onSave}
            size="sm"
            style={{ 
              backgroundColor: 'var(--editor-success-color)',
              color: '#ffffff'
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: '#d1d5db' }}
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar with Toolbar */}
        <div 
          className="w-80 border-r overflow-y-auto"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <DiagramToolbar
            selectedTool={selectedTool}
            onToolChange={onToolChange}
            canvas={content.canvas}
            onCanvasUpdate={handleCanvasUpdate}
            selectedNodes={selectedNodes}
            onNodesUpdate={(nodes) => {
              const updatedNodes = content.nodes.map(node => {
                const updated = nodes.find(n => n.id === node.id);
                return updated || node;
              });
              onContentUpdate({ nodes: updatedNodes });
            }}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4">
          <div 
            className="w-full h-full border rounded-lg"
            style={{ 
              borderColor: '#2a2a2a',
              minHeight: 'calc(100vh - 8rem)'
            }}
          >
            <DiagramCanvas
              content={content}
              mode="edit"
              selectedTool={selectedTool}
              selectedNodes={selectedNodes}
              onNodeAdd={handleNodeAdd}
              onNodeUpdate={handleNodeUpdate}
              onNodeDelete={handleNodeDelete}
              onConnectionAdd={handleConnectionAdd}
              onConnectionDelete={handleConnectionDelete}
              onSelectionChange={onSelectionChange}
              readonly={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
