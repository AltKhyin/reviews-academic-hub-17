
// ABOUTME: Enhanced import/export manager with layout and metadata support
// Handles complete block structure including layout information and styling

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReviewBlock } from '@/types/review';
import { 
  Download, 
  Upload, 
  FileText, 
  Copy, 
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportExportManagerProps {
  blocks: ReviewBlock[];
  onImport: (blocks: ReviewBlock[]) => void;
  className?: string;
}

interface ExportFormat {
  version: string;
  metadata: {
    exportedAt: string;
    blockCount: number;
    hasLayouts: boolean;
    hasColors: boolean;
  };
  blocks: ReviewBlock[];
}

export const ImportExportManager: React.FC<ImportExportManagerProps> = ({
  blocks,
  onImport,
  className
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Generate comprehensive export data
  const generateExportData = (): ExportFormat => {
    const hasLayouts = blocks.some(block => block.meta?.layout);
    const hasColors = blocks.some(block => 
      block.payload.text_color || 
      block.payload.background_color || 
      block.payload.border_color
    );

    return {
      version: '2.0.0',
      metadata: {
        exportedAt: new Date().toISOString(),
        blockCount: blocks.length,
        hasLayouts,
        hasColors
      },
      blocks: blocks.map(block => ({
        ...block,
        // Ensure all metadata is preserved
        meta: {
          ...block.meta,
          exported: true,
          originalId: block.id
        }
      }))
    };
  };

  // Handle export to JSON
  const handleExport = () => {
    setIsExporting(true);
    setError('');
    
    try {
      const exportFormat = generateExportData();
      const jsonString = JSON.stringify(exportFormat, null, 2);
      setExportData(jsonString);
      
      // Create downloadable file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `review-blocks-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Export completed:', exportFormat.metadata);
    } catch (err) {
      setError('Erro ao exportar: ' + (err as Error).message);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyExport = async () => {
    try {
      const exportFormat = generateExportData();
      const jsonString = JSON.stringify(exportFormat, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Erro ao copiar: ' + (err as Error).message);
    }
  };

  // Validate import data
  const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Dados inválidos ou vazios');
      return { valid: false, errors };
    }

    // Check if it's the new format
    if (data.version && data.blocks) {
      if (!Array.isArray(data.blocks)) {
        errors.push('Formato inválido: blocks deve ser um array');
      }
      
      data.blocks.forEach((block: any, index: number) => {
        if (!block.id || !block.type) {
          errors.push(`Bloco ${index + 1}: ID e tipo são obrigatórios`);
        }
        if (!block.payload) {
          errors.push(`Bloco ${index + 1}: payload é obrigatório`);
        }
      });
    } 
    // Check if it's legacy format (direct array of blocks)
    else if (Array.isArray(data)) {
      data.forEach((block: any, index: number) => {
        if (!block.id || !block.type) {
          errors.push(`Bloco ${index + 1}: ID e tipo são obrigatórios`);
        }
      });
    } else {
      errors.push('Formato não reconhecido');
    }

    return { valid: errors.length === 0, errors };
  };

  // Handle import from JSON
  const handleImport = () => {
    setIsImporting(true);
    setError('');
    
    try {
      const parsedData = JSON.parse(importData);
      const validation = validateImportData(parsedData);
      
      if (!validation.valid) {
        setError('Dados inválidos:\n' + validation.errors.join('\n'));
        setIsImporting(false);
        return;
      }

      // Extract blocks from either new or legacy format
      let blocksToImport: ReviewBlock[];
      
      if (parsedData.version && parsedData.blocks) {
        // New format
        blocksToImport = parsedData.blocks.map((block: any, index: number) => ({
          ...block,
          id: -(Date.now() + index), // Generate new IDs to avoid conflicts
          sort_index: index,
          visible: block.visible !== false, // Default to visible
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        console.log('Importing from v2.0 format:', parsedData.metadata);
      } else {
        // Legacy format (direct array)
        blocksToImport = parsedData.map((block: any, index: number) => ({
          ...block,
          id: -(Date.now() + index),
          sort_index: index,
          visible: block.visible !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          meta: {
            ...block.meta,
            imported: true,
            legacyFormat: true
          }
        }));
        
        console.log('Importing from legacy format');
      }

      onImport(blocksToImport);
      setImportData('');
      console.log(`Successfully imported ${blocksToImport.length} blocks`);
    } catch (err) {
      setError('Erro ao importar: ' + (err as Error).message);
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className={cn("import-export-manager", className)}>
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <FileText className="w-5 h-5" />
            Importar / Exportar
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#d1d5db' }}>
              Exportar Blocos
            </Label>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting || blocks.length === 0}
                className="flex items-center gap-2"
                size="sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exportando...' : 'Baixar JSON'}
              </Button>
              
              <Button
                onClick={handleCopyExport}
                disabled={blocks.length === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            
            <div className="text-xs" style={{ color: '#9ca3af' }}>
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                {blocks.length} blocos • Inclui layouts e cores
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#d1d5db' }}>
              Importar Blocos
            </Label>
            
            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="text-xs" style={{ color: '#9ca3af' }}>
                Arquivo JSON:
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
              />
            </div>
            
            {/* Text Input */}
            <div>
              <Label htmlFor="import-data" className="text-xs" style={{ color: '#9ca3af' }}>
                Ou cole o JSON:
              </Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui o JSON dos blocos..."
                className="mt-1 h-32 text-xs font-mono"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            
            <Button
              onClick={handleImport}
              disabled={isImporting || !importData.trim()}
              className="flex items-center gap-2 w-full"
              size="sm"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importando...' : 'Importar Blocos'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div 
              className="p-3 rounded border flex items-start gap-2"
              style={{ 
                backgroundColor: '#991b1b', 
                borderColor: '#dc2626',
                color: '#fecaca'
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <pre className="text-xs whitespace-pre-wrap">{error}</pre>
            </div>
          )}
          
          {/* Export Data Display */}
          {exportData && (
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: '#9ca3af' }}>
                Dados exportados:
              </Label>
              <Textarea
                value={exportData}
                readOnly
                className="h-32 text-xs font-mono"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
