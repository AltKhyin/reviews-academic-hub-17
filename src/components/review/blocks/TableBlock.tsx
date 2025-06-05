
// ABOUTME: Table block with comprehensive inline editing capabilities
// Provides spreadsheet-like editing with dynamic row/column management

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { EditableTable } from '@/components/editor/inline/EditableTable';
import { Table2 } from 'lucide-react';

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
  const title = payload.title || '';
  const headers = payload.headers || ['Coluna 1', 'Coluna 2'];
  const rows = payload.rows || [['Dados 1', 'Dados 2']];
  const caption = payload.caption || '';
  const compact = payload.compact || false;

  const handleTableUpdate = (data: { title: string; headers: string[]; rows: string[][]; caption?: string }) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          title: data.title,
          headers: data.headers,
          rows: data.rows,
          caption: data.caption || ''
        }
      });
    }
  };

  if (readonly) {
    return (
      <div className="table-block my-6">
        <Card 
          className="border shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          {title && (
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
                <Table2 className="w-5 h-5" style={{ color: '#f59e0b' }} />
                {title}
              </CardTitle>
            </CardHeader>
          )}
          
          <CardContent>
            <div className="overflow-x-auto">
              <table 
                className="w-full border-collapse border"
                style={{ borderColor: '#2a2a2a' }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#212121' }}>
                    {headers.map((header, index) => (
                      <th 
                        key={index} 
                        className="border p-3 text-left font-semibold"
                        style={{ 
                          borderColor: '#2a2a2a',
                          color: '#ffffff'
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
                      {row.map((cell, colIndex) => (
                        <td 
                          key={colIndex} 
                          className="border p-3"
                          style={{ 
                            borderColor: '#2a2a2a',
                            color: '#d1d5db'
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
              <div 
                className="text-sm mt-3 text-center italic"
                style={{ color: '#9ca3af' }}
              >
                {caption}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="table-block my-6">
      <Card 
        className="border shadow-lg"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Table2 className="w-5 h-5" style={{ color: '#f59e0b' }} />
            Editor de Tabela
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <EditableTable
            title={title}
            headers={headers}
            rows={rows}
            caption={caption}
            onUpdate={handleTableUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};
