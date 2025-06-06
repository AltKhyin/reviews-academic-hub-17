
// ABOUTME: Enhanced table block with comprehensive inline settings and full editing capabilities
// Supports sortable tables, row/column management, and complete customization

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Minus, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

interface TableData {
  headers: string[];
  rows: string[][];
  sortable?: boolean;
  compact?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

export const TableBlock: React.FC<TableBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  const tableData: TableData = content.table_data || {
    headers: ['Coluna 1', 'Coluna 2'],
    rows: [['Dado 1', 'Dado 2']],
    sortable: false,
    compact: false,
    striped: true,
    bordered: true
  };

  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const headerBackgroundColor = content.header_background_color || '#2a2a2a';
  const headerTextColor = content.header_text_color || '#ffffff';
  const evenRowColor = content.even_row_color || 'rgba(255,255,255,0.05)';
  const hoverColor = content.hover_color || 'rgba(59,130,246,0.1)';

  const handleTableDataChange = (newTableData: Partial<TableData>) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          table_data: {
            ...tableData,
            ...newTableData
          }
        }
      });
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string, isHeader = false) => {
    if (isHeader) {
      const newHeaders = [...tableData.headers];
      newHeaders[colIndex] = value;
      handleTableDataChange({ headers: newHeaders });
    } else {
      const newRows = [...tableData.rows];
      newRows[rowIndex][colIndex] = value;
      handleTableDataChange({ rows: newRows });
    }
  };

  const addColumn = () => {
    const newHeaders = [...tableData.headers, `Coluna ${tableData.headers.length + 1}`];
    const newRows = tableData.rows.map(row => [...row, '']);
    handleTableDataChange({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (colIndex: number) => {
    if (tableData.headers.length <= 1) return;
    const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
    const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
    handleTableDataChange({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(tableData.headers.length).fill('');
    const newRows = [...tableData.rows, newRow];
    handleTableDataChange({ rows: newRows });
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
    handleTableDataChange({ rows: newRows });
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tableData.rows.length) return;
    const newRows = [...tableData.rows];
    const [movedRow] = newRows.splice(fromIndex, 1);
    newRows.splice(toIndex, 0, movedRow);
    handleTableDataChange({ rows: newRows });
  };

  const handleSort = (colIndex: number) => {
    if (!tableData.sortable) return;
    
    const newDirection = sortColumn === colIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(colIndex);
    setSortDirection(newDirection);

    const sortedRows = [...tableData.rows].sort((a, b) => {
      const aVal = a[colIndex] || '';
      const bVal = b[colIndex] || '';
      
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

    handleTableDataChange({ rows: sortedRows });
  };

  const tableStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: headerBackgroundColor,
    color: headerTextColor
  };

  if (readonly) {
    return (
      <div className="table-block my-6">
        <div className="overflow-x-auto">
          <table 
            className={cn(
              "w-full",
              tableData.compact ? "text-sm" : "text-base",
              tableData.bordered && "border border-collapse"
            )}
            style={tableStyle}
          >
            <thead>
              <tr style={headerStyle}>
                {tableData.headers.map((header, index) => (
                  <th 
                    key={index}
                    className={cn(
                      "px-4 py-3 text-left font-semibold",
                      tableData.bordered && "border",
                      tableData.sortable && "cursor-pointer hover:opacity-80"
                    )}
                    style={{ borderColor: borderColor }}
                    onClick={() => tableData.sortable && handleSort(index)}
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      {tableData.sortable && sortColumn === index && (
                        sortDirection === 'asc' ? 
                        <ArrowUp className="w-4 h-4" /> : 
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={cn(
                    tableData.striped && rowIndex % 2 === 0 && "bg-opacity-50",
                    "hover:opacity-80 transition-colors"
                  )}
                  style={{
                    backgroundColor: tableData.striped && rowIndex % 2 === 0 ? evenRowColor : undefined
                  }}
                >
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex}
                      className={cn(
                        "px-4 py-3",
                        tableData.bordered && "border"
                      )}
                      style={{ borderColor: borderColor }}
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

      <div className="space-y-4">
        {/* Table Configuration Panel */}
        <div 
          className="p-4 rounded border space-y-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Table Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="sortable"
                checked={tableData.sortable}
                onCheckedChange={(checked) => handleTableDataChange({ sortable: checked })}
              />
              <Label htmlFor="sortable" className="text-xs" style={{ color: textColor }}>
                Ordenável
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="compact"
                checked={tableData.compact}
                onCheckedChange={(checked) => handleTableDataChange({ compact: checked })}
              />
              <Label htmlFor="compact" className="text-xs" style={{ color: textColor }}>
                Compacto
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="striped"
                checked={tableData.striped}
                onCheckedChange={(checked) => handleTableDataChange({ striped: checked })}
              />
              <Label htmlFor="striped" className="text-xs" style={{ color: textColor }}>
                Listrado
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="bordered"
                checked={tableData.bordered}
                onCheckedChange={(checked) => handleTableDataChange({ bordered: checked })}
              />
              <Label htmlFor="bordered" className="text-xs" style={{ color: textColor }}>
                Bordas
              </Label>
            </div>
          </div>

          {/* Column/Row Management */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addColumn}
              className="flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Coluna
            </Button>
            <Button
              size="sm"
              onClick={addRow}
              className="flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Linha
            </Button>
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table 
            className={cn(
              "w-full",
              tableData.compact ? "text-sm" : "text-base",
              tableData.bordered && "border border-collapse"
            )}
            style={tableStyle}
          >
            <thead>
              <tr style={headerStyle}>
                {tableData.headers.map((header, index) => (
                  <th 
                    key={index}
                    className={cn(
                      "px-4 py-3 text-left font-semibold relative group",
                      tableData.bordered && "border"
                    )}
                    style={{ borderColor: borderColor }}
                  >
                    <div className="flex items-center gap-2">
                      <InlineTextEditor
                        value={header}
                        onChange={(value) => handleCellChange(-1, index, value, true)}
                        className="font-semibold flex-1"
                        style={{ color: headerTextColor }}
                      />
                      
                      {tableData.sortable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSort(index)}
                          className="p-1 h-auto opacity-0 group-hover:opacity-100"
                        >
                          {sortColumn === index && sortDirection === 'asc' ? 
                            <ArrowUp className="w-3 h-3" /> : 
                            <ArrowDown className="w-3 h-3" />
                          }
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeColumn(index)}
                        className="p-1 h-auto opacity-0 group-hover:opacity-100 text-red-400"
                        disabled={tableData.headers.length <= 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={cn(
                    tableData.striped && rowIndex % 2 === 0 && "bg-opacity-50",
                    "group hover:opacity-80 transition-colors"
                  )}
                  style={{
                    backgroundColor: tableData.striped && rowIndex % 2 === 0 ? evenRowColor : undefined
                  }}
                >
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex}
                      className={cn(
                        "px-4 py-3 relative",
                        tableData.bordered && "border"
                      )}
                      style={{ borderColor: borderColor }}
                    >
                      <InlineTextEditor
                        value={cell}
                        onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                        placeholder="..."
                        style={{ color: textColor }}
                      />
                      
                      {colIndex === 0 && (
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveRow(rowIndex, rowIndex - 1)}
                            className="p-1 h-auto"
                            disabled={rowIndex === 0}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveRow(rowIndex, rowIndex + 1)}
                            className="p-1 h-auto"
                            disabled={rowIndex === tableData.rows.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRow(rowIndex)}
                            className="p-1 h-auto text-red-400"
                            disabled={tableData.rows.length <= 1}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
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
};
