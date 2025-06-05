
// ABOUTME: Preview component for native review content with enhanced grid layout support
// Shows real-time preview of how the review will look to readers with proper grid rendering

import React, { useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGridContainerStyles } from '@/utils/gridLayoutUtils';

interface ReviewPreviewProps {
  blocks: ReviewBlock[];
  className?: string;
}

interface LayoutGroup {
  type: 'single' | 'grid';
  blocks: ReviewBlock[];
  rowId?: string;
  gridConfig?: {
    columns: number;
    gap: number;
    columnWidths?: number[];
  };
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  blocks,
  className
}) => {
  const visibleBlocks = blocks.filter(block => block.visible);

  // Group blocks by layout rows for proper grid rendering
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    const groups: LayoutGroup[] = [];
    const processedBlockIds = new Set<number>();
    
    // Sort blocks by sort_index to maintain order
    const sortedBlocks = [...visibleBlocks].sort((a, b) => a.sort_index - b.sort_index);

    sortedBlocks.forEach((block) => {
      if (processedBlockIds.has(block.id)) return;

      const layout = block.meta?.layout;
      
      if (layout?.row_id && typeof layout.row_id === 'string') {
        // This block is part of a grid row
        const rowBlocks = sortedBlocks.filter(b => 
          b.meta?.layout?.row_id === layout.row_id && 
          !processedBlockIds.has(b.id)
        );
        
        // Mark all blocks in this row as processed
        rowBlocks.forEach(b => processedBlockIds.add(b.id));
        
        // Extract grid configuration from the first block's layout
        const gridConfig = {
          columns: layout.columns || rowBlocks.length,
          gap: layout.gap || 4,
          columnWidths: layout.columnWidths
        };
        
        groups.push({
          type: 'grid',
          blocks: rowBlocks,
          rowId: layout.row_id,
          gridConfig
        });
      } else {
        // Single block
        processedBlockIds.add(block.id);
        groups.push({
          type: 'single',
          blocks: [block]
        });
      }
    });

    return groups;
  }, [visibleBlocks]);

  if (visibleBlocks.length === 0) {
    return (
      <div className={cn("review-preview", className)} style={{ backgroundColor: '#121212' }}>
        <Card 
          className="m-6 border-dashed shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#ffffff'
          }}
        >
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#6b7280' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Nenhum conteúdo para visualizar
            </h3>
            <p style={{ color: '#d1d5db' }}>
              Adicione blocos ao editor para ver uma prévia do conteúdo aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={cn("review-preview overflow-y-auto", className)}
      style={{ backgroundColor: '#121212', color: '#ffffff' }}
    >
      {/* Preview Header */}
      <div 
        className="sticky top-0 border-b px-6 py-4 z-10"
        style={{ 
          backgroundColor: '#121212',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            Visualização
          </h3>
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            ({visibleBlocks.length} {visibleBlocks.length === 1 ? 'bloco' : 'blocos'})
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content max-w-4xl mx-auto px-6 py-8">
        {layoutGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="layout-group mb-8">
            {group.type === 'grid' && group.gridConfig ? (
              <div 
                className="grid-container"
                style={generateGridContainerStyles(
                  group.gridConfig.columns,
                  group.gridConfig.gap,
                  group.gridConfig.columnWidths
                )}
              >
                {group.blocks.map((block) => (
                  <div 
                    key={block.id} 
                    className="grid-item"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: block.meta?.alignment?.vertical === 'center' ? 'center' :
                                 block.meta?.alignment?.vertical === 'bottom' ? 'flex-end' : 'flex-start',
                      justifyContent: block.meta?.alignment?.vertical === 'center' ? 'center' :
                                     block.meta?.alignment?.vertical === 'bottom' ? 'flex-end' : 'flex-start',
                      height: '100%'
                    }}
                  >
                    <BlockRenderer
                      block={block}
                      readonly={true}
                      className="preview-grid-block w-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              group.blocks.map((block) => (
                <div key={block.id} className="preview-single-block mb-6">
                  <BlockRenderer
                    block={block}
                    readonly={true}
                    className="preview-block-content"
                  />
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Preview Footer */}
      <div 
        className="border-t px-6 py-4"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="text-center text-sm" style={{ color: '#9ca3af' }}>
          <p>Fim da visualização • {visibleBlocks.length} blocos renderizados</p>
        </div>
      </div>
    </div>
  );
};
