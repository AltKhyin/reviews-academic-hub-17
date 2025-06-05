
// ABOUTME: Import/Export manager for native editor content with JSON support
// Enables workflow Phase 2-4 with proper data validation and error handling

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileDown, 
  FileUp, 
  Upload, 
  Download,
  Check,
  AlertCircle
} from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { toast } from '@/hooks/use-toast';

interface ImportExportManagerProps {
  blocks: ReviewBlock[];
  onImport: (blocks: ReviewBlock[]) => void;
  issueTitle?: string;
  className?: string;
}

export const ImportExportManager: React.FC<ImportExportManagerProps> = ({
  blocks,
  onImport,
  issueTitle = 'Untitled Review',
  className = ''
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateBlockData = (data: any): data is ReviewBlock[] => {
    if (!Array.isArray(data)) return false;
    
    return data.every(block => 
      typeof block === 'object' &&
      block !== null &&
      typeof block.type === 'string' &&
      typeof block.payload === 'object' &&
      block.payload !== null &&
      typeof block.sort_index === 'number' &&
      typeof block.visible === 'boolean'
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        metadata: {
          title: issueTitle,
          exportedAt: new Date().toISOString(),
          version: '1.0',
          totalBlocks: blocks.length
        },
        blocks: blocks.map(block => ({
          id: block.id,
          type: block.type,
          sort_index: block.sort_index,
          payload: block.payload,
          meta: block.meta || {},
          visible: block.visible
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${issueTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_blocks.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação Concluída",
        description: `${blocks.length} blocos exportados com sucesso.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os blocos.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      let blocksToImport: ReviewBlock[];
      
      // Handle different import formats
      if (data.blocks && Array.isArray(data.blocks)) {
        // Full export format
        blocksToImport = data.blocks;
      } else if (Array.isArray(data)) {
        // Direct blocks array
        blocksToImport = data;
      } else {
        throw new Error('Invalid file format');
      }

      if (!validateBlockData(blocksToImport)) {
        throw new Error('Invalid block data structure');
      }

      // Assign temporary IDs and proper sort indices
      const processedBlocks = blocksToImport.map((block, index) => ({
        ...block,
        id: -(Date.now() + index), // Temporary negative ID
        sort_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        issue_id: '', // Will be set when saved
      }));

      onImport(processedBlocks);
      
      toast({
        title: "Importação Concluída",
        description: `${processedBlocks.length} blocos importados com sucesso.`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erro na Importação",
        description: error.message || "Arquivo inválido ou corrompido.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleImport(file);
      } else {
        toast({
          title: "Formato Inválido",
          description: "Por favor, selecione um arquivo JSON.",
          variant: "destructive",
        });
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
          <FileDown className="w-5 h-5" />
          Importar/Exportar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm" style={{ color: '#d1d5db' }}>
            Exportar Conteúdo
          </h4>
          <Button
            onClick={handleExport}
            disabled={isExporting || blocks.length === 0}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? 'Exportando...' : `Exportar ${blocks.length} Blocos`}
          </Button>
          {blocks.length === 0 && (
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Adicione blocos para habilitar a exportação
            </p>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm" style={{ color: '#d1d5db' }}>
            Importar Conteúdo
          </h4>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            {isImporting ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isImporting ? 'Importando...' : 'Importar Blocos'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Arquivos JSON exportados anteriormente
          </p>
        </div>

        {/* Warning */}
        <div 
          className="flex items-start gap-2 p-3 rounded border"
          style={{ backgroundColor: '#fbbf24', borderColor: '#f59e0b', color: '#92400e' }}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <strong>Atenção:</strong> Importar substituirá todo o conteúdo atual. 
            Exporte primeiro se desejar manter uma cópia.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
