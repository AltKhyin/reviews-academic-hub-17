// ABOUTME: Enhanced table block with comprehensive inline settings and color integration
// Handles tabular data display with sorting, editing, and customizable styling

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const headers = content.headers || [];
  const rows = content.rows || [];
  const sortable = content.sortable || false;
  const compact = content.compact || false;
  
  // Color system integration
  const textColor = content.text_color || '#d1d5db';
  const backgroundColor = content.background_color || 'transparent';
  const borderColor = content.border_color || '#2a2a2a';
  const headerBgColor = content.header_bg_color || '#1a1a1a';
  const cellBgColor = content.cell_bg_color || 'transparent';

  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    if (!onUpdate) return;
    
    const newRows = [...rows];
    if (!newRows[rowIndex]) newRows[rowIndex] = [];
    newRows[rowIndex][colIndex] = value;
    
    onUpdate({
      content: {
        ...content,
        rows: newRows
      }
    });
  };

  const handleHeaderEdit = (index: number, value: string) => {
    if (!onUpdate) return;
    
    const newHeaders = [...headers];
    newHeaders[index] = value;
    
    onUpdate({
      content: {
        ...content,
        headers: newHeaders
      }
    });
  };

  const addColumn = () => {
    if (!onUpdate) return;
    
    const newHeaders = [...headers, `Coluna ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    
    onUpdate({
      content: {
        ...content,
        headers: newHeaders,
        rows: newRows
      }
    });
  };

  const addRow = () => {
    if (!onUpdate) return;
    
    const newRow = Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    
    onUpdate({
      content: {
        ...content,
        rows: newRows
      }
    });
  };

  const deleteColumn = (index: number) => {
    if (!onUpdate) return;
    
    const newHeaders = headers.filter((_, i) => i !== index);
    const newRows = rows.map(row => row.filter((_, i) => i !== index));
    
    onUpdate({
      content: {
        ...content,
        headers: newHeaders,
        rows: newRows
      }
    });
  };

  const deleteRow = (index: number) => {
    if (!onUpdate) return;
    
    const newRows = rows.filter((_, i) => i !== index);
    
    onUpdate({
      content: {
        ...content,
        rows: newRows
      }
    });
  };

  const handleSort = (columnIndex: number) => {
    if (!sortable || !onUpdate) return;
    
    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);
    
    const sortedRows = [...rows].sort((a, b) => {
      const aVal = a[columnIndex] || '';
      const bVal = b[columnIndex] || '';
      
      if (newDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    onUpdate({
      content: {
        ...content,
        rows: sortedRows
      }
    });
  };

  const containerStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
  };

  const tableStyle: React.CSSProperties = {
    borderColor: borderColor
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: headerBgColor,
    color: textColor,
    borderColor: borderColor
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: cellBgColor !== 'transparent' ? cellBgColor : undefined,
    color: textColor,
    borderColor: borderColor
  };

  if (readonly) {
    return (
      <div className="table-block my-6">
        <div 
          className="rounded-lg p-4"
          style={containerStyle}
        >
          <div className="overflow-x-auto">
            <table 
              className={cn(
                "w-full border-collapse border",
                compact ? "text-sm" : "text-base"
              )}
              style={tableStyle}
            >
              {headers.length > 0 && (
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="border px-4 py-2 text-left font-semibold"
                        style={headerStyle}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border px-4 py-2"
                        style={cellStyle}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div 
        className="rounded-lg p-4"
        style={containerStyle}
      >
        <div className="overflow-x-auto">
          <table 
            className={cn(
              "w-full border-collapse border",
              compact ? "text-sm" : "text-base"
            )}
            style={tableStyle}
          >
            {/* Headers */}
            {headers.length > 0 && (
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="border px-4 py-2 text-left font-semibold relative group/header"
                      style={headerStyle}
                      onClick={() => sortable && handleSort(index)}
                    >
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderEdit(index, e.target.value)}
                        className="bg-transparent border-none outline-none w-full"
                        style={{ color: textColor }}
                        placeholder="Cabeçalho"
                      />
                      
                      {/* Column Controls */}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(index);
                          }}
                          className="h-4 w-4 p-0 bg-red-800 border border-red-600"
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                      
                      {sortable && sortColumn === index && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="border px-2 py-2 w-12" style={headerStyle}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addColumn}
                      className="h-6 w-6 p-0"
                      title="Adicionar coluna"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </th>
                </tr>
              </thead>
            )}

            {/* Body */}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group/row">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border px-4 py-2 relative"
                      style={cellStyle}
                      onClick={() => setEditingCell({row: rowIndex, col: cellIndex})}
                    >
                      {editingCell?.row === rowIndex && editingCell?.col === cellIndex ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null);
                          }}
                          className="bg-transparent border-none outline-none w-full"
                          style={{ color: textColor }}
                          autoFocus
                        />
                      ) : (
                        <div className="cursor-pointer">
                          {cell || (
                            <span style={{ color: '#6b7280' }}>
                              Clique para editar
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="border px-2 py-2 w-12" style={cellStyle}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(rowIndex)}
                      className="h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity bg-red-800 border border-red-600"
                      title="Remover linha"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              
              {/* Add Row */}
              <tr>
                <td 
                  colSpan={headers.length + 1} 
                  className="border px-4 py-2 text-center"
                  style={cellStyle}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addRow}
                    className="flex items-center gap-2"
                    title="Adicionar linha"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Linha
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {headers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              Clique em "Adicionar Coluna" para começar sua tabela
            </div>
            <Button
              variant="outline"
              onClick={addColumn}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeira Coluna
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
