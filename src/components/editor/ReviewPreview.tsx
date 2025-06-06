
// ABOUTME: Enhanced preview component with complete 2D grid support and proper dark theme
// Shows real-time preview of how the review will look to readers with proper 2D grid rendering

import React, { useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGridContainerStyles } from '@/utils/gridLayoutUtils';
import { Grid2DLayout } from '@/types/grid';

interface ReviewPreviewProps {
  blocks: ReviewBlock[];
  className?: string;
}

interface LayoutGroup {
  type: 'single' | '1d-grid' | '2d-grid';
  blocks: ReviewBlock[];
  rowId?: string;
  gridId?: string;
  gridConfig?: {
    columns: number;
    rows: number;
    gap: number;
    columnWidths?: number[];
    rowHeights?: number[];
  };
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  blocks,
  className
}) => {
  const visibleBlocks = blocks.filter(block => block.visible);

  // Enhanced layout groups processing to handle both 1D and 2D grids
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    const groups: LayoutGroup[] = [];
    const processedBlockIds = new Set<number>();
    
    // Sort blocks by sort_index to maintain order
    const sortedBlocks = [...visibleBlocks].sort((a, b) => a.sort_index - b.sort_index);

    // First, handle 2D grids
    const grid2DIds = new Set<string>();
    sortedBlocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      if (gridId && !grid2DIds.has(gridId)) {
        grid2DIds.add(gridId);
        const gridBlocks = sortedBlocks.filter(b => b.meta?.layout?.grid_id === gridId);
        
        // Validate that blocks have valid grid positions
        const validGridBlocks = gridBlocks.filter(b => {
          const pos = b.meta?.layout?.grid_position;
          return pos && typeof pos.row === 'number' && typeof pos.column === 'number';
        });
        
        if (validGridBlocks.length > 0) {
          validGridBlocks.forEach(b => processedBlockIds.add(b.id));
          
          // Extract grid configuration
          const layout = validGridBlocks[0]?.meta?.layout;
          const gridConfig = {
            columns: layout?.columns || 2,
            rows: layout?.grid_rows || 2,
            gap: layout?.gap || 4,
            columnWidths: layout?.columnWidths,
            rowHeights: layout?.rowHeights
          };
          
          groups.push({
            type: '2d-grid',
            blocks: validGridBlocks,
            gridId,
            gridConfig
          });
        }
      }
    });

    // Then handle 1D grids
    const rowIds = new Set<string>();
    sortedBlocks.forEach(block => {
      const rowId = block.meta?.layout?.row_id;
      if (rowId && !rowIds.has(rowId) && !processedBlockIds.has(block.id)) {
        rowIds.add(rowId);
        const rowBlocks = sortedBlocks.filter(b => 
          b.meta?.layout?.row_id === rowId && !processedBlockIds.has(b.id)
        );
        
        if (rowBlocks.length > 0) {
          rowBlocks.forEach(b => processedBlockIds.add(b.id));
          
          // Extract grid configuration for 1D grid
          const layout = rowBlocks[0]?.meta?.layout;
          const gridConfig = {
            columns: layout?.columns || rowBlocks.length,
            rows: 1,
            gap: layout?.gap || 4,
            columnWidths: layout?.columnWidths
          };
          
          groups.push({
            type: '1d-grid',
            blocks: rowBlocks,
            rowId,
            gridConfig
          });
        }
      }
    });

    // Finally, handle single blocks
    sortedBlocks.forEach(block => {
      if (!processedBlockIds.has(block.id)) {
        groups.push({
          type: 'single',
          blocks: [block]
        });
      }
    });

    return groups;
  }, [visibleBlocks]);

  // Create 2D grid structure for rendering
  const create2DGrid = (blocks: ReviewBlock[], config: any): Grid2DLayout => {
    const { columns, rows, gap, columnWidths, rowHeights } = config;
    
    // Create empty grid structure
    const grid: Grid2DLayout = {
      id: blocks[0]?.meta?.layout?.grid_id || 'preview-grid',
      columns,
      gap,
      columnWidths: columnWidths || Array(columns).fill(100 / columns),
      rowHeights: rowHeights || Array(rows).fill(120),
      rows: Array.from({ length: rows }, (_, rowIndex) => ({
        id: `preview-row-${rowIndex}`,
        index: rowIndex,
        cells: Array.from({ length: columns }, (_, colIndex) => ({
          id: `preview-cell-${rowIndex}-${colIndex}`,
          row: rowIndex,
          column: colIndex,
          block: undefined
        }))
      }))
    };

    // Place blocks in their positions
    blocks.forEach(block => {
      const position = block.meta?.layout?.grid_position;
      if (position && position.row < rows && position.column < columns) {
        grid.rows[position.row].cells[position.column].block = block;
      }
    });

    return grid;
  };

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
            {group.type === '2d-grid' && group.gridConfig ? (
              <div className="preview-2d-grid">
                {(() => {
                  const grid = create2DGrid(group.blocks, group.gridConfig);
                  return (
                    <div 
                      className="grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: grid.columnWidths
                          ? grid.columnWidths.map(w => `${w}%`).join(' ')
                          : `repeat(${grid.columns}, 1fr)`,
                        gridTemplateRows: grid.rowHeights
                          ? grid.rowHeights.map(h => `${h}px`).join(' ')
                          : `repeat(${grid.rows.length}, auto)`,
                        gap: `${grid.gap * 0.25}rem`,
                        width: '100%'
                      }}
                    >
                      {grid.rows.map((row) =>
                        row.cells.map((cell) => (
                          <div
                            key={cell.id}
                            className="grid-cell"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-start',
                              alignItems: 'stretch',
                              minHeight: '120px',
                              backgroundColor: cell.block ? 'transparent' : '#1a1a1a',
                              border: cell.block ? 'none' : '1px dashed #2a2a2a',
                              borderRadius: '4px'
                            }}
                          >
                            {cell.block && (
                              <BlockRenderer
                                block={cell.block}
                                readonly={true}
                                className="preview-grid-block w-full h-full"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
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
                      alignItems: 'stretch',
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
