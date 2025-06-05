
// ABOUTME: Inline table editor with cell-by-cell editing and dynamic rows/columns
// Provides spreadsheet-like editing experience within table blocks

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineTextEditor } from './InlineTextEditor';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTableProps {
  title: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  onUpdate: (data: { title: string; headers: string[]; rows: string[][]; caption?: string }) => void;
  className?: string;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  title,
  headers,
  rows,
  caption = '',
  onUpdate,
  className = ''
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localHeaders, setLocalHeaders] = useState(headers);
  const [localRows, setLocalRows] = useState(rows);
  const [localCaption, setLocalCaption] = useState(caption);

  const updateData = (newData: Partial<{ title: string; headers: string[]; rows: string[][]; caption: string }>) => {
    const updated = {
      title: newData.title ?? localTitle,
      headers: newData.headers ?? localHeaders,
      rows: newData.rows ?? localRows,
      caption: newData.caption ?? localCaption
    };
    
    setLocalTitle(updated.title);
    setLocalHeaders(updated.headers);
    setLocalRows(updated.rows);
    setLocalCaption(updated.caption);
    
    onUpdate(updated);
  };

  const addColumn = () => {
    const newHeaders = [...localHeaders, `Coluna ${localHeaders.length + 1}`];
    const newRows = localRows.map(row => [...row, '']);
    updateData({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (localHeaders.length <= 1) return;
    const newHeaders = localHeaders.filter((_, i) => i !== index);
    const newRows = localRows.map(row => row.filter((_, i) => i !== index));
    updateData({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(localHeaders.length).fill('');
    const newRows = [...localRows, newRow];
    updateData({ rows: newRows });
  };

  const removeRow = (index: number) => {
    if (localRows.length <= 1) return;
    const newRows = localRows.filter((_, i) => i !== index);
    updateData({ rows: newRows });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...localHeaders];
    newHeaders[index] = value;
    updateData({ headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...localRows];
    newRows[rowIndex][colIndex] = value;
    updateData({ rows: newRows });
  };

  return (
    <div className={cn("editable-table-container space-y-4", className)}>
      {/* Table Title */}
      <InlineTextEditor
        value={localTitle}
        onChange={(value) => updateData({ title: value })}
        placeholder="Título da tabela"
        className="text-lg font-semibold"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table 
          className="w-full border-collapse border"
          style={{ borderColor: '#2a2a2a' }}
        >
          {/* Headers */}
          <thead>
            <tr style={{ backgroundColor: '#212121' }}>
              <th className="w-8 border p-2" style={{ borderColor: '#2a2a2a' }}>
                <GripVertical className="w-4 h-4" style={{ color: '#6b7280' }} />
              </th>
              {localHeaders.map((header, index) => (
                <th 
                  key={index} 
                  className="border p-2 min-w-[150px]"
                  style={{ borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-center gap-2">
                    <InlineTextEditor
                      value={header}
                      onChange={(value) => updateHeader(index, value)}
                      placeholder={`Cabeçalho ${index + 1}`}
                      className="flex-1 font-medium"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeColumn(index)}
                      className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                      disabled={localHeaders.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </th>
              ))}
              <th className="w-12 border p-2" style={{ borderColor: '#2a2a2a' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={addColumn}
                  className="w-6 h-6 p-0"
                >
                  <Plus className="w-3 h-3" style={{ color: '#10b981' }} />
                </Button>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {localRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                <td 
                  className="border p-2 text-center"
                  style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs" style={{ color: '#9ca3af' }}>{rowIndex + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRow(rowIndex)}
                      className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100"
                      disabled={localRows.length <= 1}
                    >
                      <Trash2 className="w-2 h-2" style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </td>
                {row.map((cell, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="border p-2"
                    style={{ borderColor: '#2a2a2a' }}
                  >
                    <InlineTextEditor
                      value={cell}
                      onChange={(value) => updateCell(rowIndex, colIndex, value)}
                      placeholder="Dados"
                      className="w-full"
                    />
                  </td>
                ))}
                <td className="border p-2" style={{ borderColor: '#2a2a2a' }}>
                  {/* Empty cell for column actions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={addRow}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Linha
        </Button>
      </div>

      {/* Caption */}
      <InlineTextEditor
        value={localCaption}
        onChange={(value) => updateData({ caption: value })}
        placeholder="Legenda da tabela (opcional)"
        className="text-sm"
        multiline
      />
    </div>
  );
};
