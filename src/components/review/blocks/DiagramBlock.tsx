
// ABOUTME: Diagram block component for interactive diagram rendering
// Fixed to use proper type imports from review types

import React, { useState, useCallback } from 'react';
import { ReviewBlock, DiagramContent } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Maximize2, Download, Settings } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Type-safe content access
  const diagramContent = block.content as DiagramContent;
  
  const handleDiagramUpdate = useCallback((newContent: DiagramContent) => {
    if (onUpdate) {
      onUpdate({ content: newContent });
    }
  }, [onUpdate]);

  const handleExport = useCallback(() => {
    // Implementation for diagram export
    console.log('Exporting diagram:', block.id);
  }, [block.id]);

  if (!diagramContent?.nodes) {
    return (
      <div className="diagram-block-empty border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium mb-2">Diagrama vazio</p>
          <p className="text-sm">Configure o conteúdo do diagrama</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-block">
      {/* Diagram Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {block.content?.title || 'Diagrama'}
        </h3>
        
        {!readonly && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              title="Visualizar em tela cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              title="Exportar diagrama"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Diagram Canvas */}
      <div 
        className="diagram-canvas border border-gray-600 rounded-lg bg-white"
        style={{ 
          width: diagramContent.layout?.width || 800, 
          height: diagramContent.layout?.height || 600 
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${diagramContent.layout?.width || 800} ${diagramContent.layout?.height || 600}`}
        >
          {/* Render diagram nodes */}
          {diagramContent.nodes.map(node => (
            <g key={node.id}>
              {node.type === 'rect' && (
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={node.backgroundColor || '#f3f4f6'}
                  stroke={node.color || '#6b7280'}
                  strokeWidth="2"
                />
              )}
              {node.type === 'circle' && (
                <circle
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height / 2}
                  r={Math.min(node.width, node.height) / 2}
                  fill={node.backgroundColor || '#f3f4f6'}
                  stroke={node.color || '#6b7280'}
                  strokeWidth="2"
                />
              )}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={node.color || '#374151'}
                fontSize="14"
              >
                {node.label}
              </text>
            </g>
          ))}
          
          {/* Render connections */}
          {diagramContent.connections.map(connection => {
            const sourceNode = diagramContent.nodes.find(n => n.id === connection.sourceId);
            const targetNode = diagramContent.nodes.find(n => n.id === connection.targetId);
            
            if (!sourceNode || !targetNode) return null;
            
            const x1 = sourceNode.x + sourceNode.width / 2;
            const y1 = sourceNode.y + sourceNode.height / 2;
            const x2 = targetNode.x + targetNode.width / 2;
            const y2 = targetNode.y + targetNode.height / 2;
            
            return (
              <g key={connection.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={connection.color || '#6b7280'}
                  strokeWidth="2"
                  strokeDasharray={connection.type === 'dashed' ? '5,5' : '0'}
                />
                {connection.type === 'arrow' && (
                  <polygon
                    points={`${x2-5},${y2-5} ${x2+5},${y2-5} ${x2},${y2+5}`}
                    fill={connection.color || '#6b7280'}
                  />
                )}
                {connection.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={connection.color || '#374151'}
                    fontSize="12"
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Diagram Description */}
      {block.content?.description && (
        <div className="mt-4 text-sm text-gray-300">
          {block.content.description}
        </div>
      )}
    </div>
  );
};
