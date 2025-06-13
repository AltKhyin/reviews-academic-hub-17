
// ABOUTME: Diagram block component for interactive diagram rendering
// Fixed to use proper type imports from review types and corrected node properties

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
              {node.type === 'rectangle' && (
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={node.size.width}
                  height={node.size.height}
                  fill={node.style?.backgroundColor || '#f3f4f6'}
                  stroke={node.style?.borderColor || '#6b7280'}
                  strokeWidth="2"
                />
              )}
              {node.type === 'circle' && (
                <circle
                  cx={node.position.x + node.size.width / 2}
                  cy={node.position.y + node.size.height / 2}
                  r={Math.min(node.size.width, node.size.height) / 2}
                  fill={node.style?.backgroundColor || '#f3f4f6'}
                  stroke={node.style?.borderColor || '#6b7280'}
                  strokeWidth="2"
                />
              )}
              <text
                x={node.position.x + node.size.width / 2}
                y={node.position.y + node.size.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={node.style?.textColor || '#374151'}
                fontSize="14"
              >
                {node.text}
              </text>
            </g>
          ))}
          
          {/* Render connections */}
          {diagramContent.connections.map(connection => {
            const sourceNode = diagramContent.nodes.find(n => n.id === connection.sourceNodeId);
            const targetNode = diagramContent.nodes.find(n => n.id === connection.targetNodeId);
            
            if (!sourceNode || !targetNode) return null;
            
            const x1 = sourceNode.position.x + sourceNode.size.width / 2;
            const y1 = sourceNode.position.y + sourceNode.size.height / 2;
            const x2 = targetNode.position.x + targetNode.size.width / 2;
            const y2 = targetNode.position.y + targetNode.size.height / 2;
            
            return (
              <g key={connection.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={connection.style?.strokeColor || '#6b7280'}
                  strokeWidth="2"
                  strokeDasharray={connection.style?.strokeStyle === 'dashed' ? '5,5' : '0'}
                />
                {connection.style?.arrowType === 'arrow' && (
                  <polygon
                    points={`${x2-5},${y2-5} ${x2+5},${y2-5} ${x2},${y2+5}`}
                    fill={connection.style?.strokeColor || '#6b7280'}
                  />
                )}
                {connection.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={connection.label.style?.textColor || '#374151'}
                    fontSize="12"
                  >
                    {connection.label.text}
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
