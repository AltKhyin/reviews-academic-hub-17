
// ABOUTME: Enhanced table block with comprehensive color system integration
// Renders editable and readonly tables with customizable styling

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { EditableTable } from '@/components/editor/inline/EditableTable';

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
  const payload = block.payload;
  const title = payload.title || 'Tabela';
  const headers = payload.headers || ['Coluna 1', 'Coluna 2'];
  const rows = payload.rows || [['', '']];
  const caption = payload.caption || '';

  // Extract colors from payload
  const colors = {
    table_header_bg: payload.table_header_bg,
    table_header_text: payload.table_header_text,
    table_cell_bg: payload.table_cell_bg,
    table_cell_text: payload.table_cell_text,
    table_border: payload.table_border,
    text_color: payload.text_color,
    background_color: payload.background_color,
    border_color: payload.border_color
  };

  const handleTableUpdate = (data: { title: string; headers: string[]; rows: string[][]; caption?: string }) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          title: data.title,
          headers: data.headers,
          rows: data.rows,
          caption: data.caption
        }
      });
    }
  };

  if (readonly) {
    // Apply colors for readonly display
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

    return (
      <div 
        className="table-block my-6 p-4 rounded-lg"
        style={{
          backgroundColor: tableColors.background !== 'transparent' ? tableColors.background : undefined,
          borderColor: tableColors.containerBorder,
          borderWidth: tableColors.containerBorder !== 'transparent' ? '1px' : undefined,
          borderStyle: tableColors.containerBorder !== 'transparent' ? 'solid' : undefined
        }}
      >
        {title && (
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: tableColors.text }}
          >
            {title}
          </h3>
        )}
        
        <div className="overflow-x-auto">
          <table 
            className="w-full border-collapse rounded-lg overflow-hidden"
            style={{ borderColor: tableColors.border }}
          >
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="p-3 text-left font-semibold border"
                    style={{
                      backgroundColor: tableColors.headerBg,
                      color: tableColors.headerText,
                      borderColor: tableColors.border
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="p-3 border"
                      style={{
                        backgroundColor: tableColors.cellBg !== 'transparent' ? tableColors.cellBg : undefined,
                        color: tableColors.cellText,
                        borderColor: tableColors.border
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
        
        {caption && (
          <p 
            className="text-sm mt-3 italic"
            style={{ color: tableColors.text }}
          >
            {caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="table-block my-6">
      <EditableTable
        title={title}
        headers={headers}
        rows={rows}
        caption={caption}
        colors={colors}
        onUpdate={handleTableUpdate}
      />
    </div>
  );
};
