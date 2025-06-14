
// ABOUTME: Enhanced native review viewer with proper string ID support and block construction
// Main viewer component for native reviews with complete type consistency

import React, { useState, useEffect, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from './BlockRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGridContainerStyles } from '@/utils/gridLayoutUtils';

interface NativeReviewViewerProps {
  blocks: ReviewBlock[];
  className?: string;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
}

interface LayoutGroup {
  type: 'single' | '1d-grid' | '2d-grid';
  blocks: ReviewBlock[];
  rowId?: string;
  gridId?: string;
  gridConfig?: {
    columns: number;
    gap: number;
    columnWidths?: number[];
  };
  grid2DStructure?: any;
}

export const NativeReviewViewer: React.FC<NativeReviewViewerProps> = ({
  blocks,
  className,
  onInteraction,
  onSectionView
}) => {
  const [viewedBlocks, setViewedBlocks] = useState<Set<string>>(new Set());

  // Filter visible blocks
  const visibleBlocks = useMemo(() => 
    blocks.filter(block => block.visible !== false), [blocks]
  );

  // Organize blocks into layout groups
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    const groups: LayoutGroup[] = [];
    const processedBlockIds = new Set<string>();
    
    const sortedBlocks = [...visibleBlocks].sort((a, b) => a.sort_index - b.sort_index);

    // Handle 2D grids first
    const grid2DIds = new Set<string>();
    sortedBlocks.forEach((block) => {
      const gridId = block.meta?.layout?.grid_id;
      if (gridId && !grid2DIds.has(gridId) && !processedBlockIds.has(block.id)) {
        grid2DIds.add(gridId);
        const gridBlocks = sortedBlocks.filter(b => 
          b.meta?.layout?.grid_id === gridId && !processedBlockIds.has(b.id)
        );
        
        if (gridBlocks.length > 0) {
          gridBlocks.forEach(b => processedBlockIds.add(b.id));
          groups.push({
            type: '2d-grid',
            blocks: gridBlocks,
            gridId
          });
        }
      }
    });

    // Handle 1D grids
    const rowIds = new Set<string>();
    sortedBlocks.forEach((block) => {
      const rowId = block.meta?.layout?.row_id;
      if (rowId && !rowIds.has(rowId) && !processedBlockIds.has(block.id)) {
        rowIds.add(rowId);
        const rowBlocks = sortedBlocks.filter(b => 
          b.meta?.layout?.row_id === rowId && !processedBlockIds.has(b.id)
        );
        
        if (rowBlocks.length > 0) {
          rowBlocks.forEach(b => processedBlockIds.add(b.id));
          
          if (rowBlocks.length > 1) {
            const layout = rowBlocks[0]?.meta?.layout;
            groups.push({
              type: '1d-grid',
              blocks: rowBlocks,
              rowId,
              gridConfig: {
                columns: layout?.columns || rowBlocks.length,
                gap: layout?.gap || 4,
                columnWidths: layout?.columnWidths
              }
            });
          }
        }
      }
    });

    // Handle single blocks
    sortedBlocks.forEach((block) => {
      if (!processedBlockIds.has(block.id)) {
        groups.push({
          type: 'single',
          blocks: [block]
        });
      }
    });

    return groups.sort((a, b) => {
      const aMinSort = Math.min(...a.blocks.map(block => block.sort_index));
      const bMinSort = Math.min(...b.blocks.map(block => block.sort_index));
      return aMinSort - bMinSort;
    });
  }, [visibleBlocks]);

  // Track block views
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.getAttribute('data-block-id');
            if (blockId && !viewedBlocks.has(blockId)) {
              setViewedBlocks(prev => new Set([...prev, blockId]));
              onSectionView?.(blockId);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const blockElements = document.querySelectorAll('[data-block-id]');
    blockElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [viewedBlocks, onSectionView]);

  const handleBlockInteraction = (blockId: string, interactionType: string, data?: any) => {
    onInteraction?.(blockId, interactionType, data);
  };

  if (visibleBlocks.length === 0) {
    return (
      <div className={cn("native-review-viewer", className)}>
        <Card className="m-6 border-dashed">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-200">
              Nenhum conteúdo disponível
            </h3>
            <p className="text-gray-400">
              Esta revisão não possui conteúdo nativo para visualizar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("native-review-viewer", className)}>
      <div className="review-content max-w-4xl mx-auto">
        {layoutGroups.map((group, groupIndex) => (
          <div
            key={`group-${groupIndex}`}
            className="layout-group mb-8"
            data-group-type={group.type}
          >
            {group.type === '1d-grid' && group.gridConfig ? (
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
                    data-block-id={block.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: block.meta?.alignment?.horizontal === 'center' ? 'center' :
                                 block.meta?.alignment?.horizontal === 'right' ? 'flex-end' : 'flex-start',
                      justifyContent: block.meta?.alignment?.vertical === 'center' ? 'center' :
                                     block.meta?.alignment?.vertical === 'bottom' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <BlockRenderer
                      block={block}
                      readonly={true}
                      onInteraction={handleBlockInteraction}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            ) : group.type === '2d-grid' ? (
              <div className="grid-2d-container">
                {group.blocks.map((block) => (
                  <div 
                    key={block.id}
                    data-block-id={block.id}
                    className="grid-2d-item"
                  >
                    <BlockRenderer
                      block={block}
                      readonly={true}
                      onInteraction={handleBlockInteraction}
                    />
                  </div>
                ))}
              </div>
            ) : (
              group.blocks.map((block) => (
                <div
                  key={block.id}
                  className="single-block mb-6"
                  data-block-id={block.id}
                >
                  <BlockRenderer
                    block={block}
                    readonly={true}
                    onInteraction={handleBlockInteraction}
                  />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
