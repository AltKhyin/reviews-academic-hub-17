
// ABOUTME: Data table with sorting and formatting support
// Responsive table with proper accessibility and mobile handling

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ReviewBlock, TablePayload } from '@/types/review';
import { cn } from '@/lib/utils';

interface TableBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as TablePayload;
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedRows, setSortedRows] = useState(payload.rows);

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id, 'viewed', {
              block_type: 'table',
              table_number: payload.table_number,
              row_count: payload.rows.length,
              column_count: payload.headers.length,
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
  }, [block.id, onInteraction, payload.table_number, payload.rows.length, payload.headers.length]);

  const handleSort = (columnIndex: number) => {
    if (!payload.sortable) return;

    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);

    const sorted = [...payload.rows].sort((a, b) => {
      const aVal = a[columnIndex] || '';
      const bVal = b[columnIndex] || '';
      
      // Try to parse as numbers
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      return newDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    });

    setSortedRows(sorted);

    onInteraction?.(block.id, 'table_sorted', {
      column_index: columnIndex,
      sort_direction: newDirection,
      column_header: payload.headers[columnIndex],
      timestamp: Date.now()
    });
  };

  const getSortIcon = (columnIndex: number) => {
    if (!payload.sortable) return null;
    
    if (sortColumn !== columnIndex) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="table-block my-8">
      {/* Caption */}
      {payload.caption && (
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-gray-700">
            {payload.table_number && (
              <strong>Tabela {payload.table_number}: </strong>
            )}
            {payload.caption}
          </p>
        </div>
      )}

      {/* Table Container - Responsive */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {payload.headers.map((header, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "font-semibold text-gray-700",
                    payload.sortable && "cursor-pointer hover:bg-gray-100 select-none"
                  )}
                  onClick={() => handleSort(index)}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {getSortIcon(index)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <TableCell 
                    key={cellIndex}
                    className="text-sm text-gray-900"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Table info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {payload.rows.length} linha{payload.rows.length !== 1 ? 's' : ''}, {payload.headers.length} coluna{payload.headers.length !== 1 ? 's' : ''}
        {payload.sortable && sortColumn !== null && (
          <span className="ml-2">
            • Ordenado por "{payload.headers[sortColumn]}" ({sortDirection === 'asc' ? 'crescente' : 'decrescente'})
          </span>
        )}
      </div>
    </div>
  );
};
