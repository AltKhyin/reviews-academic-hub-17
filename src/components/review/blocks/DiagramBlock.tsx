
// ABOUTME: Enhanced diagram block with comprehensive null safety and responsive design
// Supports scientific diagrams with inline editing and fullscreen capabilities

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewBlock, DiagramContent } from '@/types/review';
import { DiagramCanvas } from './diagram/DiagramCanvas';
import { DiagramToolbar } from './diagram/DiagramToolbar';
import { DiagramFullscreenViewer } from './diagram/DiagramFullscreenViewer';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
import { cn } from '@/lib/utils';
import { Maximize2, Edit3 } from 'lucide-react';

interface DiagramBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  
  // Create complete diagram content with all required fields and fallbacks
  const diagramContent: DiagramContent = {
    title: content.title || 'Untitled Diagram',
    description: content.description || '',
    canvas: {
      width: content.canvas?.width || 800,
      height: content.canvas?.height || 600,
      backgroundColor: content.canvas?.backgroundColor || '#ffffff',
      gridEnabled: content.canvas?.gridEnabled ?? true,
      gridSize: content.canvas?.gridSize || 20,
      gridColor: content.canvas?.gridColor || '#e5e7eb',
      snapToGrid: content.canvas?.snapToGrid ?? true,
      ...content.canvas
    },
    nodes: Array.isArray(content.nodes) ? content.nodes : [],
    connections: Array.isArray(content.connections) ? content.connections : [],
    template: content.template || undefined,
    exportSettings: {
      format: 'svg',
      quality: 1,
      transparentBackground: false,
      ...content.exportSettings
    },
    accessibility: {
      altText: content.accessibility?.altText || 'Scientific diagram',
      longDescription: content.accessibility?.longDescription || '',
      ...content.accessibility
    }
  };

  // Spacing system integration
  const customSpacing = block.meta?.spacing;
  const defaultSpacing = getDefaultSpacing('diagram');
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);

  const handleContentUpdate = (updates: Partial<DiagramContent>) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          ...updates
        }
      });
    }
  };

  const handleNodeAdd = (nodeType: string, position: { x: number; y: number }) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType as any,
      position,
      size: { width: 120, height: 60 },
      text: 'New Node',
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af',
        textColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid' as const,
        fontSize: 14,
        fontWeight: 'normal' as const,
        textAlign: 'center' as const,
        opacity: 1
      }
    };

    handleContentUpdate({
      nodes: [...diagramContent.nodes, newNode]
    });
  };

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    const updatedNodes = diagramContent.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    handleContentUpdate({
      nodes: updatedNodes
    });
  };

  const handleNodeDelete = (nodeId: string) => {
    const updatedNodes = diagramContent.nodes.filter(node => node.id !== nodeId);
    const updatedConnections = diagramContent.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    
    handleContentUpdate({
      nodes: updatedNodes,
      connections: updatedConnections
    });
  };

  const handleConnectionAdd = (connection: any) => {
    handleContentUpdate({
      connections: [...diagramContent.connections, connection]
    });
  };

  const handleConnectionDelete = (connectionId: string) => {
    const updatedConnections = diagramContent.connections.filter(
      conn => conn.id !== connectionId
    );
    
    handleContentUpdate({
      connections: updatedConnections
    });
  };

  if (readonly) {
    return (
      <div className="diagram-block w-full max-w-full overflow-hidden" style={spacingStyles}>
        <Card className="w-full max-w-full overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium truncate" style={{ color: '#ffffff' }}>
                  {diagramContent.title}
                </h3>
                {diagramContent.description && (
                  <p className="text-sm mt-1 break-words" style={{ color: '#d1d5db' }}>
                    {diagramContent.description}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="aspect-[4/3] w-full max-w-full overflow-hidden">
            <DiagramCanvas
              content={diagramContent}
              mode="preview"
              selectedTool={selectedTool}
              selectedNodes={selectedNodes}
              onNodeAdd={handleNodeAdd}
              onNodeUpdate={handleNodeUpdate}
              onNodeDelete={handleNodeDelete}
              onConnectionAdd={handleConnectionAdd}
              onConnectionDelete={handleConnectionDelete}
              onSelectionChange={setSelectedNodes}
              readonly={true}
            />
          </div>
        </Card>

        {isFullscreen && (
          <DiagramFullscreenViewer
            content={diagramContent}
            selectedTool={selectedTool}
            selectedNodes={selectedNodes}
            onContentUpdate={handleContentUpdate}
            onToolChange={setSelectedTool}
            onSelectionChange={setSelectedNodes}
            onSave={handleContentUpdate}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="diagram-block group relative w-full max-w-full overflow-hidden" style={spacingStyles}>
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card className="w-full max-w-full overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={diagramContent.title}
                onChange={(e) => handleContentUpdate({ title: e.target.value })}
                className="text-lg font-medium bg-transparent border-none outline-none w-full"
                style={{ color: '#ffffff' }}
                placeholder="Diagram Title"
              />
              <textarea
                value={diagramContent.description}
                onChange={(e) => handleContentUpdate({ description: e.target.value })}
                className="text-sm mt-1 bg-transparent border-none outline-none w-full resize-none"
                style={{ color: '#d1d5db' }}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <DiagramToolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          selectedNodes={selectedNodes}
          canvas={diagramContent.canvas}
          onCanvasUpdate={(updates) => handleContentUpdate({ canvas: { ...diagramContent.canvas, ...updates } })}
          onNodesUpdate={(nodes) => handleContentUpdate({ nodes })}
        />
        
        {/* Canvas */}
        <div className="aspect-[4/3] w-full max-w-full overflow-hidden">
          <DiagramCanvas
            content={diagramContent}
            mode="edit"
            selectedTool={selectedTool}
            selectedNodes={selectedNodes}
            onNodeAdd={handleNodeAdd}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onConnectionAdd={handleConnectionAdd}
            onConnectionDelete={handleConnectionDelete}
            onSelectionChange={setSelectedNodes}
            readonly={false}
          />
        </div>
      </Card>

      {/* Fullscreen Editor */}
      {isFullscreen && (
        <DiagramFullscreenViewer
          content={diagramContent}
          selectedTool={selectedTool}
          selectedNodes={selectedNodes}
          onContentUpdate={handleContentUpdate}
          onToolChange={setSelectedTool}
          onSelectionChange={setSelectedNodes}
          onSave={handleContentUpdate}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};
