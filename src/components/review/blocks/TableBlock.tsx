
// ABOUTME: Enhanced table block with responsive design and improved readability
// Displays structured data with proper formatting and accessibility

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReviewBlock } from '@/types/review';
import { BarChart3 } from 'lucide-react';

interface TableBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
}

export const TableBlock: React.FC<TableBlockProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const title = payload.title || '';
  const headers = payload.headers || [];
  const rows = payload.rows || [];
  const caption = payload.caption || '';
  const compact = payload.compact || false;

  if (!headers.length && !rows.length) {
    return (
      <Card 
        className="table-block my-6 border shadow-md"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-12 h-12 mb-4" style={{ color: '#6b7280' }} />
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Nenhum dado da tabela configurado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="table-block my-6 border shadow-md"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <BarChart3 className="w-5 h-5" style={{ color: '#f59e0b' }} />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={compact ? "p-3" : "p-6"}>
        <div className="overflow-x-auto">
          <Table>
            {headers.length > 0 && (
              <TableHeader>
                <TableRow style={{ borderColor: '#2a2a2a' }}>
                  {headers.map((header: string, index: number) => (
                    <TableHead 
                      key={index}
                      className="font-semibold"
                      style={{ color: '#ffffff' }}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            
            <TableBody>
              {rows.map((row: string[], rowIndex: number) => (
                <TableRow 
                  key={rowIndex}
                  style={{ borderColor: '#2a2a2a' }}
                  className="hover:bg-gray-800 transition-colors"
                >
                  {row.map((cell: string, cellIndex: number) => (
                    <TableCell 
                      key={cellIndex}
                      style={{ color: '#d1d5db' }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {caption && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#2a2a2a' }}>
            <p className="text-sm italic" style={{ color: '#9ca3af' }}>
              {caption}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
