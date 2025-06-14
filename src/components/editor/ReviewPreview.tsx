
// ABOUTME: Enhanced preview component with complete 2D grid support
// Shows real-time preview of both 1D and 2D grid layouts with proper rendering

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

interface Grid2DBlock {
  block: ReviewBlock;
  position: { row: number; column: number };
}

interface Grid2DStructure {
  id: string;
  columns: number;
  rows: number;
  gap: number;
  columnWidths?: number[];
  rowHeights?: number[];
  blocks: Grid2DBlock[];
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
  grid2DStructure?: Grid2DStructure;
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  blocks,
  className
}) => {
  const visibleBlocks = blocks.filter(block => block.visible);

  // Enhanced layout grouping with 2D grid support
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    const groups: LayoutGroup[] = [];
    const processedBlockIds = new Set<string>();
    
    const sortedBlocks = [...visibleBlocks].sort((a, b) => a.sort_index - b.sort_index);

    // First pass: Handle 2D grids
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
          
          // Extract grid configuration
          const firstBlock = gridBlocks[0];
          const layout = firstBlock.meta?.layout;
          const columns = layout?.columns || 2;
          const rows = layout?.grid_rows || Math.ceil(gridBlocks.length / columns);
          const gap = layout?.gap || 4;
          const columnWidths = layout?.columnWidths;
          const rowHeights = layout?.rowHeights;
          
          // Create 2D grid structure - handle position normalization
          const grid2DStructure: Grid2DStructure = {
            id: gridId,
            columns,
            rows,
            gap,
            columnWidths,
            rowHeights,
            blocks: gridBlocks.map(block => {
              const position = block.meta?.layout?.grid_position;
              // Normalize position to always be an object
              let normalizedPosition: { row: number; column: number };
              
              if (typeof position === 'object' && position !== null && 'row' in position && 'column' in position) {
                normalizedPosition = position;
              } else if (typeof position === 'number') {
                // Convert linear position to grid position
                normalizedPosition = {
                  row: Math.floor(position / columns),
                  column: position % columns
                };
              } else {
                // Default position
                normalizedPosition = { row: 0, column: 0 };
              }
              
              return {
                block,
                position: normalizedPosition
              };
            }).filter(item => 
              item.position.row >= 0 && 
              item.position.column >= 0 &&
              item.position.row < rows &&
              item.position.column < columns
            )
          };
          
          groups.push({
            type: '2d-grid',
            blocks: gridBlocks,
            gridId,
            grid2DStructure
          });
        }
      }
    });

    // Second pass: Handle 1D grids
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
          
          if (rowBlocks.length > 1 || (rowBlocks[0]?.meta?.layout?.columns ?? 1) > 1) {
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

    // Third pass: Handle single blocks
    sortedBlocks.forEach((block) => {
      if (!processedBlockIds.has(block.id)) {
        groups.push({
          type: 'single',
          blocks: [block]
        });
      }
    });

    // Sort by minimum sort_index within each group
    return groups.sort((a, b) => {
      const aMinSort = Math.min(...a.blocks.map(block => block.sort_index));
      const bMinSort = Math.min(...b.blocks.map(block => block.sort_index));
      return aMinSort - bMinSort;
    });
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
            {group.type === '2d-grid' && group.grid2DStructure ? (
              <div className="grid-2d-preview">
                {/* INVISIBLE GRID: No backgrounds, borders, or labels */}
                <div 
                  className="grid-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: group.grid2DStructure.columnWidths 
                      ? group.grid2DStructure.columnWidths.map(w => `${w}%`).join(' ')
                      : `repeat(${group.grid2DStructure.columns}, 1fr)`,
                    gridTemplateRows: group.grid2DStructure.rowHeights
                      ? group.grid2DStructure.rowHeights.map(h => `${h}px`).join(' ')
                      : `repeat(${group.grid2DStructure.rows}, minmax(120px, auto))`,
                    gap: `${group.grid2DStructure.gap}px`,
                    // NO visual grid elements - completely invisible
                  }}
                >
                  {/* Create invisible grid cells */}
                  {Array.from({ length: group.grid2DStructure.rows }).map((_, rowIndex) =>
                    Array.from({ length: group.grid2DStructure.columns }).map((_, colIndex) => {
                      const blockAtPosition = group.grid2DStructure!.blocks.find(
                        item => item.position.row === rowIndex && item.position.column === colIndex
                      );
                      
                      return (
                        <div
                          key={`cell-${rowIndex}-${colIndex}`}
                          style={{
                            gridColumn: colIndex + 1,
                            gridRow: rowIndex + 1,
                            minHeight: '120px',
                            // NO borders, backgrounds, or visual indicators
                          }}
                        >
                          {blockAtPosition && (
                            <BlockRenderer
                              block={blockAtPosition.block}
                              readonly={true}
                              className="preview-grid-block w-full h-full"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {/* NO grid info labels in preview */}
              </div>
            ) : group.type === '1d-grid' && group.gridConfig ? (
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
