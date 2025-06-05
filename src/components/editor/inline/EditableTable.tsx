
// ABOUTME: Inline editable table component with spreadsheet-like functionality
// Provides dynamic row/column management with inline text editing

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
  onUpdate: (data: { title: string; headers: string[]; rows: string[][]; caption?: string }) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  title,
  headers,
  rows,
  caption = '',
  onUpdate
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

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
    <div className="editable-table space-y-4" style={{ direction: 'ltr' }}>
      {/* Title Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: '#ffffff' }}>
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
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          />
        ) : (
          <div
            className="p-2 border rounded cursor-pointer hover:bg-gray-800"
            onClick={() => setIsEditingTitle(true)}
            style={{ 
              backgroundColor: '#212121',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            {title || 'Clique para adicionar título'}
          </div>
        )}
      </div>

      {/* Table Editor */}
      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ display: 'table' }}>
          {/* Headers Row */}
          <div 
            className="table-row"
            style={{ backgroundColor: '#212121' }}
          >
            <div className="table-cell w-8 p-2 border text-center" style={{ borderColor: '#2a2a2a' }}>
              <GripVertical className="w-4 h-4 mx-auto" style={{ color: '#9ca3af' }} />
            </div>
            {headers.map((header, index) => (
              <div key={index} className="table-cell p-0 border" style={{ borderColor: '#2a2a2a' }}>
                <div className="flex">
                  <Input
                    value={header}
                    onChange={(e) => handleHeaderChange(index, e.target.value)}
                    className="border-0 bg-transparent font-semibold"
                    style={{ color: '#ffffff' }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeColumn(index)}
                    className="w-8 h-8 p-0 flex-shrink-0"
                    disabled={headers.length <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="table-cell w-8 p-2 border text-center" style={{ borderColor: '#2a2a2a' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={addColumn}
                className="w-6 h-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Data Rows */}
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="table-row">
              <div className="table-cell w-8 p-2 border text-center" style={{ borderColor: '#2a2a2a' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRow(rowIndex)}
                  className="w-6 h-6 p-0"
                  disabled={rows.length <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
              </div>
              {row.map((cell, colIndex) => (
                <div key={colIndex} className="table-cell p-0 border" style={{ borderColor: '#2a2a2a' }}>
                  <Input
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="border-0 bg-transparent"
                    style={{ color: '#d1d5db' }}
                  />
                </div>
              ))}
              <div className="table-cell w-8 p-2 border" style={{ borderColor: '#2a2a2a' }} />
            </div>
          ))}

          {/* Add Row */}
          <div className="table-row">
            <div className="table-cell w-8 p-2 border text-center" style={{ borderColor: '#2a2a2a' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={addRow}
                className="w-6 h-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {headers.map((_, index) => (
              <div key={index} className="table-cell p-2 border" style={{ borderColor: '#2a2a2a' }} />
            ))}
            <div className="table-cell w-8 p-2 border" style={{ borderColor: '#2a2a2a' }} />
          </div>
        </div>
      </div>

      {/* Caption Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: '#ffffff' }}>
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
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          />
        ) : (
          <div
            className="p-2 border rounded cursor-pointer hover:bg-gray-800 min-h-[60px]"
            onClick={() => setIsEditingCaption(true)}
            style={{ 
              backgroundColor: '#212121',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            {caption || 'Clique para adicionar legenda'}
          </div>
        )}
      </div>
    </div>
  );
};
