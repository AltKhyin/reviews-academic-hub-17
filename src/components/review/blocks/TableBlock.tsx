
// ABOUTME: Data table with sorting and filtering capabilities and custom styling
// Displays structured data with interactive features and theming support

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ReviewBlock, TablePayload } from '@/types/review';
import { cn } from '@/lib/utils';

interface TableBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as TablePayload;
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortedRows, setSortedRows] = useState<string[][]>(payload.rows || []);
  const customStyles = block.meta?.styles || {};

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'table',
              has_caption: !!payload.caption,
              row_count: payload.rows?.length || 0,
              column_count: payload.headers?.length || 0,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, payload.caption, payload.rows, payload.headers]);

  useEffect(() => {
    setSortedRows(payload.rows || []);
  }, [payload.rows]);

  const handleSort = (columnIndex: number) => {
    if (!payload.sortable || readonly) return;

    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === columnIndex) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortColumn(newDirection ? columnIndex : null);
    setSortDirection(newDirection);

    if (newDirection) {
      const sorted = [...(payload.rows || [])].sort((a, b) => {
        const aVal = a[columnIndex] || '';
        const bVal = b[columnIndex] || '';
        
        // Try to parse as numbers first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Fall back to string comparison
        return newDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
      
      setSortedRows(sorted);
      
      onInteraction?.(block.id.toString(), 'table_sorted', {
        column_index: columnIndex,
        sort_direction: newDirection,
        timestamp: Date.now()
      });
    } else {
      setSortedRows(payload.rows || []);
    }
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
    }
    
    return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
  };

  if (!payload.headers || !payload.rows) {
    return (
      <div 
        className="table-block my-6"
        data-block-id={block.id}
      >
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
            Table configuration incomplete. Please add headers and data rows.
          </CardContent>
        </Card>
      </div>
    );
  }

  const tableStyle = {
    backgroundColor: customStyles.backgroundColor || 'transparent',
    borderColor: customStyles.borderColor || 'var(--editor-primary-border)'
  };

  return (
    <div 
      className="table-block my-6"
      data-block-id={block.id}
    >
      {payload.caption && (
        <div className="mb-3 text-center">
          <span 
            className="text-sm font-medium px-3 py-1 rounded"
            style={{
              color: customStyles.captionColor || 'var(--editor-primary-text)',
              backgroundColor: customStyles.captionBg || 'var(--editor-secondary-bg)'
            }}
          >
            {payload.caption}
          </span>
        </div>
      )}
      
      <Card 
        className="overflow-hidden"
        style={{
          borderColor: tableStyle.borderColor,
          backgroundColor: tableStyle.backgroundColor
        }}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: customStyles.headerBg || 'var(--editor-secondary-bg)' }}>
                <tr>
                  {payload.headers.map((header, index) => (
                    <th
                      key={index}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b",
                        payload.sortable && !readonly && "cursor-pointer hover:bg-opacity-80 transition-colors"
                      )}
                      style={{
                        color: customStyles.headerColor || 'var(--editor-primary-text)',
                        borderColor: tableStyle.borderColor
                      }}
                      onClick={() => handleSort(index)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{header}</span>
                        {payload.sortable && !readonly && getSortIcon(index)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ 
                backgroundColor: customStyles.bodyBg || 'var(--editor-card-bg)',
                borderColor: tableStyle.borderColor
              }}>
                {sortedRows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{
                      backgroundColor: rowIndex % 2 === 0 
                        ? customStyles.evenRowBg || 'transparent'
                        : customStyles.oddRowBg || 'var(--editor-hover-bg)'
                    }}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm whitespace-nowrap"
                        style={{
                          color: customStyles.cellColor || 'var(--editor-primary-text)'
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Info */}
          <div 
            className="px-4 py-2 border-t"
            style={{
              backgroundColor: customStyles.footerBg || 'var(--editor-secondary-bg)',
              borderColor: tableStyle.borderColor
            }}
          >
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--editor-muted-text)' }}>
              <span>
                {sortedRows.length} {sortedRows.length === 1 ? 'linha' : 'linhas'} • {payload.headers.length} {payload.headers.length === 1 ? 'coluna' : 'colunas'}
              </span>
              {payload.sortable && !readonly && (
                <span>Clique nos cabeçalhos para ordenar</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
