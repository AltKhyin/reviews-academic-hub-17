
// ABOUTME: Import/Export manager for native review content with JSON validation
// Provides safe import/export functionality for review blocks and settings

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReviewBlock } from '@/types/review';
import { toast } from '@/hooks/use-toast';
import { 
  FileDown, 
  FileUp, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  Copy,
  Clipboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportExportManagerProps {
  blocks: ReviewBlock[];
  onImport: (blocks: ReviewBlock[]) => void;
  className?: string;
}

interface ExportData {
  version: string;
  timestamp: string;
  blocks: ReviewBlock[];
  metadata: {
    blockCount: number;
    types: string[];
  };
}

export const ImportExportManager: React.FC<ImportExportManagerProps> = ({
  blocks,
  onImport,
  className = ''
}) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate imported JSON data
  const validateImportData = (data: any): { valid: boolean; error?: string; blocks?: ReviewBlock[] } => {
    try {
      // Check if data has required structure
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Dados inválidos: formato JSON incorreto' };
      }

      // Check for blocks array
      if (!Array.isArray(data.blocks)) {
        return { valid: false, error: 'Dados inválidos: propriedade "blocks" não encontrada ou não é um array' };
      }

      // Validate each block
      for (let i = 0; i < data.blocks.length; i++) {
        const block = data.blocks[i];
        
        if (!block.type || typeof block.type !== 'string') {
          return { valid: false, error: `Bloco ${i + 1}: tipo inválido ou ausente` };
        }

        if (!block.payload || typeof block.payload !== 'object') {
          return { valid: false, error: `Bloco ${i + 1}: payload inválido ou ausente` };
        }

        // Ensure required properties exist with defaults
        block.id = block.id || -(Date.now() + Math.random() + i);
        block.sort_index = block.sort_index !== undefined ? block.sort_index : i;
        block.visible = block.visible !== undefined ? block.visible : true;
        block.created_at = block.created_at || new Date().toISOString();
        block.updated_at = new Date().toISOString();
        block.meta = block.meta || { styles: {}, conditions: {}, analytics: { track_views: true, track_interactions: true } };
      }

      return { valid: true, blocks: data.blocks };
    } catch (error) {
      return { valid: false, error: `Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  };

  // Export blocks to JSON
  const handleExport = () => {
    try {
      const exportData: ExportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        blocks: blocks.map(block => ({
          ...block,
          // Remove temporary IDs for cleaner export
          id: block.id < 0 ? undefined : block.id
        })) as ReviewBlock[],
        metadata: {
          blockCount: blocks.length,
          types: [...new Set(blocks.map(b => b.type))]
        }
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `review-blocks-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação Concluída",
        description: `${blocks.length} blocos exportados com sucesso.`,
      });

      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os blocos.",
        variant: "destructive",
      });
    }
  };

  // Copy export data to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const exportData: ExportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        blocks,
        metadata: {
          blockCount: blocks.length,
          types: [...new Set(blocks.map(b => b.type))]
        }
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(jsonData);

      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  // Import from JSON text
  const handleImportFromText = () => {
    if (!importData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados JSON para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const parsedData = JSON.parse(importData);
      const validation = validateImportData(parsedData);

      if (!validation.valid) {
        toast({
          title: "Dados Inválidos",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      onImport(validation.blocks || []);
      setImportData('');
      setShowImportDialog(false);

      toast({
        title: "Importação Concluída",
        description: `${validation.blocks?.length || 0} blocos importados com sucesso.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erro na Importação",
        description: "JSON inválido. Verifique o formato dos dados.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Import from file
  const handleImportFromFile = () => {
    if (!importFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        const validation = validateImportData(parsedData);

        if (!validation.valid) {
          toast({
            title: "Arquivo Inválido",
            description: validation.error,
            variant: "destructive",
          });
          return;
        }

        onImport(validation.blocks || []);
        setImportFile(null);
        setShowImportDialog(false);

        toast({
          title: "Importação Concluída",
          description: `${validation.blocks?.length || 0} blocos importados do arquivo.`,
        });
      } catch (error) {
        console.error('File import error:', error);
        toast({
          title: "Erro no Arquivo",
          description: "Não foi possível ler o arquivo. Verifique se é um JSON válido.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(importFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  return (
    <div className={cn("import-export-manager flex gap-2", className)}>
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={blocks.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>
              Exportar Blocos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{ color: '#d1d5db' }}>
              Exportar {blocks.length} blocos do editor nativo.
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar Arquivo
              </Button>
              <Button variant="outline" onClick={handleCopyToClipboard} className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copiar JSON
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>
              Importar Blocos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label className="text-sm" style={{ color: '#d1d5db' }}>
                Selecionar Arquivo
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="flex-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                />
                <Button 
                  onClick={handleImportFromFile}
                  disabled={!importFile || isProcessing}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isProcessing ? 'Processando...' : 'Importar'}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2a2a' }}></div>
              <span className="text-xs" style={{ color: '#9ca3af' }}>ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2a2a' }}></div>
            </div>

            {/* JSON Text Input */}
            <div>
              <Label className="text-sm" style={{ color: '#d1d5db' }}>
                Colar JSON
              </Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole o JSON dos blocos aqui..."
                className="mt-1 h-32 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
              <Button 
                onClick={handleImportFromText}
                disabled={!importData.trim() || isProcessing}
                className="mt-2 w-full flex items-center gap-2"
              >
                <Clipboard className="w-4 h-4" />
                {isProcessing ? 'Processando...' : 'Importar do Texto'}
              </Button>
            </div>

            <div 
              className="flex items-start gap-2 p-3 rounded"
              style={{ backgroundColor: '#1e40af', borderColor: '#3b82f6' }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#93c5fd' }} />
              <div className="text-xs" style={{ color: '#dbeafe' }}>
                Importar substituirá todos os blocos atuais. Esta ação não pode ser desfeita.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
