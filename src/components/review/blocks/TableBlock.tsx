// ABOUTME: Data table block for displaying structured information
// Supports sorting, filtering, and responsive design

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            onInteraction?.(block.id.toString(), 'viewed', {
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

    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortColumn === columnIndex) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(columnIndex);
    setSortDirection(newDirection);

    const sorted = [...payload.rows].sort((a, b) => {
      const aValue = a[columnIndex] || '';
      const bValue = b[columnIndex] || '';
      
      // Try to parse as numbers first
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Fall back to string comparison
      const comparison = aValue.localeCompare(bValue);
      return newDirection === 'asc' ? comparison : -comparison;
    });

    setSortedRows(sorted);

    onInteraction?.(block.id.toString(), 'table_sorted', {
      column_index: columnIndex,
      direction: newDirection,
      timestamp: Date.now()
    });
  };

  const getSortIcon = (columnIndex: number) => {
    if (!payload.sortable) return null;
    
    if (sortColumn !== columnIndex) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-600" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <Card className="table-block my-6">
      {payload.caption && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {payload.table_number && (
              <span className="text-blue-600 mr-2">
                Tabela {payload.table_number}:
              </span>
            )}
            {payload.caption}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {payload.headers.map((header, index) => (
                  <TableHead 
                    key={index} 
                    className={cn(
                      "font-semibold text-gray-900",
                      payload.sortable && "cursor-pointer hover:bg-gray-100"
                    )}
                    onClick={() => handleSort(index)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{header}</span>
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
                    <TableCell key={cellIndex} className="py-3">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
