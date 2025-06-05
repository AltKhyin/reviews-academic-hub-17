
// ABOUTME: Data table with sorting and filtering capabilities
// Displays structured data with interactive features

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
      <Card className="table-block border-red-200 dark:border-red-800">
        <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
          Dados da tabela inválidos ou ausentes
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="table-block my-6">
      {payload.caption && (
        <div className="mb-3 text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
            {payload.caption}
          </span>
        </div>
      )}
      
      <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {payload.headers.map((header, index) => (
                    <th
                      key={index}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600",
                        payload.sortable && !readonly && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      )}
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
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedRows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
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
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
