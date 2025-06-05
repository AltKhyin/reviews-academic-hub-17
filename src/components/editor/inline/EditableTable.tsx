
// ABOUTME: Enhanced editable table with color system integration and proper layout
// Provides dynamic row/column management with comprehensive color customization

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTableProps {
  title: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  colors?: {
    table_header_bg?: string;
    table_header_text?: string;
    table_cell_bg?: string;
    table_cell_text?: string;
    table_border?: string;
    text_color?: string;
    background_color?: string;
    border_color?: string;
  };
  onUpdate: (data: { title: string; headers: string[]; rows: string[][]; caption?: string }) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  title,
  headers,
  rows,
  caption = '',
  colors = {},
  onUpdate
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  // Apply color system with defaults
  const tableColors = {
    headerBg: colors.table_header_bg || '#212121',
    headerText: colors.table_header_text || '#ffffff',
    cellBg: colors.table_cell_bg || 'transparent',
    cellText: colors.table_cell_text || '#d1d5db',
    border: colors.table_border || '#2a2a2a',
    text: colors.text_color || '#ffffff',
    background: colors.background_color || 'transparent',
    containerBorder: colors.border_color || '#2a2a2a'
  };

  const handleTitleChange = useCallback((newTitle: string) => {
    onUpdate({ title: newTitle, headers, rows, caption });
  }, [headers, rows, caption, onUpdate]);

  const handleCaptionChange = useCallback((newCaption: string) => {
    onUpdate({ title, headers, rows, caption: newCaption });
  }, [title, headers, rows, onUpdate]);

  const handleHeaderChange = useCallback((index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onUpdate({ title, headers: newHeaders, rows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    onUpdate({ title, headers, rows: newRows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  const addColumn = useCallback(() => {
    const newHeaders = [...headers, `Coluna ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    onUpdate({ title, headers: newHeaders, rows: newRows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  const removeColumn = useCallback((index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== index);
    const newRows = rows.map(row => row.filter((_, i) => i !== index));
    onUpdate({ title, headers: newHeaders, rows: newRows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  const addRow = useCallback(() => {
    const newRow = new Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    onUpdate({ title, headers, rows: newRows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  const removeRow = useCallback((index: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    onUpdate({ title, headers, rows: newRows, caption });
  }, [title, headers, rows, caption, onUpdate]);

  return (
    <div 
      className="editable-table space-y-4 p-4 rounded-lg" 
      style={{ 
        direction: 'ltr',
        backgroundColor: tableColors.background !== 'transparent' ? tableColors.background : undefined,
        borderColor: tableColors.containerBorder,
        borderWidth: tableColors.containerBorder !== 'transparent' ? '1px' : undefined,
        borderStyle: tableColors.containerBorder !== 'transparent' ? 'solid' : undefined
      }}
    >
      {/* Title Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: tableColors.text }}>
          Título da Tabela
        </label>
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            placeholder="Título da tabela"
            autoFocus
            style={{ 
              backgroundColor: '#212121',
              borderColor: tableColors.border,
              color: tableColors.text
            }}
          />
        ) : (
          <div
            className="p-2 border rounded cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setIsEditingTitle(true)}
            style={{ 
              backgroundColor: '#212121',
              borderColor: tableColors.border,
              color: tableColors.text
            }}
          >
            {title || 'Clique para adicionar título'}
          </div>
        )}
      </div>

      {/* Table Editor - Using CSS Grid for proper layout */}
      <div className="overflow-x-auto">
        <div 
          className="inline-grid gap-0 border rounded-lg"
          style={{ 
            gridTemplateColumns: `40px repeat(${headers.length}, minmax(150px, 1fr)) 40px`,
            borderColor: tableColors.border
          }}
        >
          {/* Headers Row */}
          <div 
            className="grid-cell p-2 border-r border-b text-center"
            style={{ 
              backgroundColor: tableColors.headerBg,
              borderColor: tableColors.border 
            }}
          >
            <GripVertical className="w-4 h-4 mx-auto" style={{ color: '#9ca3af' }} />
          </div>
          
          {headers.map((header, index) => (
            <div 
              key={index} 
              className="grid-cell border-r border-b"
              style={{ 
                backgroundColor: tableColors.headerBg,
                borderColor: tableColors.border 
              }}
            >
              <div className="flex h-full">
                <Input
                  value={header}
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                  className="border-0 bg-transparent font-semibold flex-1"
                  style={{ color: tableColors.headerText }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeColumn(index)}
                  className="w-8 h-8 p-0 flex-shrink-0 hover:bg-red-900"
                  disabled={headers.length <= 1}
                  title="Remover coluna"
                >
                  <Minus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <div 
            className="grid-cell p-2 border-b text-center"
            style={{ 
              backgroundColor: tableColors.headerBg,
              borderColor: tableColors.border 
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={addColumn}
              className="w-6 h-6 p-0 hover:bg-green-900"
              title="Adicionar coluna"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Data Rows */}
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <div 
                className="grid-cell p-2 border-r border-b text-center"
                style={{ borderColor: tableColors.border }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRow(rowIndex)}
                  className="w-6 h-6 p-0 hover:bg-red-900"
                  disabled={rows.length <= 1}
                  title="Remover linha"
                >
                  <Minus className="w-3 h-3" />
                </Button>
              </div>
              
              {row.map((cell, colIndex) => (
                <div 
                  key={colIndex} 
                  className="grid-cell border-r border-b"
                  style={{ 
                    backgroundColor: tableColors.cellBg !== 'transparent' ? tableColors.cellBg : undefined,
                    borderColor: tableColors.border 
                  }}
                >
                  <Input
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="border-0 bg-transparent w-full h-full"
                    style={{ color: tableColors.cellText }}
                  />
                </div>
              ))}
              
              <div 
                className="grid-cell p-2 border-b"
                style={{ borderColor: tableColors.border }}
              />
            </React.Fragment>
          ))}

          {/* Add Row */}
          <div 
            className="grid-cell p-2 border-r text-center"
            style={{ borderColor: tableColors.border }}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={addRow}
              className="w-6 h-6 p-0 hover:bg-green-900"
              title="Adicionar linha"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {headers.map((_, index) => (
            <div 
              key={index} 
              className="grid-cell p-2 border-r" 
              style={{ borderColor: tableColors.border }}
            />
          ))}
          
          <div 
            className="grid-cell p-2"
            style={{ borderColor: tableColors.border }}
          />
        </div>
      </div>

      {/* Caption Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: tableColors.text }}>
          Legenda da Tabela (Opcional)
        </label>
        {isEditingCaption ? (
          <Textarea
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            onBlur={() => setIsEditingCaption(false)}
            placeholder="Adicione uma legenda para a tabela"
            rows={2}
            autoFocus
            style={{ 
              backgroundColor: '#212121',
              borderColor: tableColors.border,
              color: tableColors.text
            }}
          />
        ) : (
          <div
            className="p-2 border rounded cursor-pointer hover:bg-gray-800 min-h-[60px] transition-colors"
            onClick={() => setIsEditingCaption(true)}
            style={{ 
              backgroundColor: '#212121',
              borderColor: tableColors.border,
              color: tableColors.text
            }}
          >
            {caption || 'Clique para adicionar legenda'}
          </div>
        )}
      </div>
    </div>
  );
};
