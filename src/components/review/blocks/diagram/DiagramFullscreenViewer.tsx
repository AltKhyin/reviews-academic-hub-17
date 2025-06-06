
// ABOUTME: Fullscreen viewer for diagram editing with improved responsive design and disabled drag-drop
// Provides dedicated workspace for complex diagram creation without block positioning conflicts

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
        backgroundColor: 'transparent',
        borderColor: '#3b82f6',
        textColor: '#1f2937',
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

  const handleTemplateApply = useCallback((templateNodes: DiagramNode[], templateConnections: DiagramConnection[]) => {
    onContentUpdate({
      nodes: templateNodes,
      connections: templateConnections
    });
  }, [onContentUpdate]);

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

  // Disable drag and drop for blocks when in fullscreen mode
  useEffect(() => {
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const disableDropZone = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Disable all drag and drop events on the body
    document.body.addEventListener('dragstart', disableDragDrop, true);
    document.body.addEventListener('dragover', disableDropZone, true);
    document.body.addEventListener('drop', disableDropZone, true);
    document.body.addEventListener('dragenter', disableDropZone, true);
    document.body.addEventListener('dragleave', disableDropZone, true);

    // Add CSS to disable draggable elements
    const style = document.createElement('style');
    style.textContent = `
      .diagram-fullscreen-active * {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      .diagram-fullscreen-active .sortable-ghost,
      .diagram-fullscreen-active .sortable-chosen,
      .diagram-fullscreen-active [draggable] {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('diagram-fullscreen-active');

    return () => {
      document.body.removeEventListener('dragstart', disableDragDrop, true);
      document.body.removeEventListener('dragover', disableDropZone, true);
      document.body.removeEventListener('drop', disableDropZone, true);
      document.body.removeEventListener('dragenter', disableDropZone, true);
      document.body.removeEventListener('dragleave', disableDropZone, true);
      document.head.removeChild(style);
      document.body.classList.remove('diagram-fullscreen-active');
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background diagram-fullscreen-container"
      style={{ backgroundColor: '#121212' }}
    >
      {/* Header */}
      <div 
        className="h-14 border-b flex items-center justify-between px-4"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <h2 className="text-lg font-semibold truncate" style={{ color: '#ffffff' }}>
            <span className="hidden sm:inline">{content.title} - Editor Fullscreen</span>
            <span className="sm:hidden">Editor Fullscreen</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={onSave}
            size="sm"
            style={{ 
              backgroundColor: 'var(--editor-success-color)',
              color: '#ffffff'
            }}
            className="hidden sm:flex"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          
          <Button
            onClick={onSave}
            size="sm"
            style={{ 
              backgroundColor: 'var(--editor-success-color)',
              color: '#ffffff'
            }}
            className="sm:hidden"
          >
            <Save className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: '#d1d5db' }}
            className="hidden sm:flex"
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: '#d1d5db' }}
            className="sm:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Sidebar with Toolbar - Responsive */}
        <div 
          className="w-full sm:w-80 border-r overflow-y-auto flex-shrink-0 sm:block"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="h-full">
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
              onTemplateApply={handleTemplateApply}
            />
          </div>
        </div>

        {/* Canvas Area - Hidden on mobile when toolbar is shown */}
        <div className="hidden sm:flex flex-1 overflow-auto p-4">
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

      {/* Mobile Canvas Toggle */}
      <div className="sm:hidden fixed bottom-4 right-4 z-10">
        <Button
          onClick={() => {
            const toolbar = document.querySelector('.diagram-toolbar')?.parentElement;
            const canvas = document.querySelector('.diagram-canvas-container');
            
            if (toolbar && canvas) {
              if (toolbar.classList.contains('hidden')) {
                toolbar.classList.remove('hidden');
                canvas.classList.add('hidden');
              } else {
                toolbar.classList.add('hidden');
                canvas.classList.remove('hidden');
              }
            }
          }}
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          Alternar Vista
        </Button>
      </div>

      {/* Mobile Canvas View */}
      <div className="sm:hidden diagram-canvas-container hidden absolute inset-0 top-14">
        <div className="w-full h-full p-4">
          <div 
            className="w-full h-full border rounded-lg"
            style={{ 
              borderColor: '#2a2a2a'
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
