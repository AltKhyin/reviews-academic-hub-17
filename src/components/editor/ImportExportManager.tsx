
// ABOUTME: Enhanced import/export manager with comprehensive content preservation
// Provides safe import/export with migration support for all editor features including complete content mapping

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
import { 
  validateImportData, 
  migrateImportData, 
  exportBlocks,
  ExportData 
} from '@/utils/importExportUtils';

interface ImportExportManagerProps {
  blocks: ReviewBlock[];
  onImport: (blocks: ReviewBlock[]) => void;
  className?: string;
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

  // Enhanced export with comprehensive metadata
  const handleExport = () => {
    try {
      const exportData = exportBlocks(blocks);
      
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `review-blocks-enhanced-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Export successful:', {
        blocks: exportData.blocks.length,
        version: exportData.version,
        hasContent: exportData.blocks.every(b => Object.keys(b.content).length > 0)
      });

      toast({
        title: "Exportação Concluída",
        description: `${blocks.length} blocos exportados com preservação completa de conteúdo (v${exportData.version}).`,
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

  // Enhanced clipboard copy with version info
  const handleCopyToClipboard = async () => {
    try {
      const exportData = exportBlocks(blocks);
      const jsonData = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(jsonData);

      toast({
        title: "Copiado!",
        description: `Dados v${exportData.version} com preservação completa copiados para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  // Import from JSON text with enhanced migration
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
          description: validation.errors.join('; '),
          variant: "destructive",
        });
        return;
      }

      // Use enhanced migration
      const migratedBlocks = migrateImportData(parsedData);
      
      console.log('Import successful:', {
        originalBlocks: parsedData.blocks?.length || 0,
        migratedBlocks: migratedBlocks.length,
        contentPreserved: migratedBlocks.every(b => Object.keys(b.content).length > 0),
        version: parsedData.version
      });

      onImport(migratedBlocks);
      setImportData('');
      setShowImportDialog(false);

      const migrationInfo = parsedData.version && parsedData.version.startsWith('1.') 
        ? ' (migração automática de v1.x aplicada)' 
        : '';

      toast({
        title: "Importação Concluída",
        description: `${migratedBlocks.length} blocos importados com preservação completa de conteúdo${migrationInfo}.`,
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

  // Import from file with enhanced migration
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
            description: validation.errors.join('; '),
            variant: "destructive",
          });
          return;
        }

        // Use enhanced migration
        const migratedBlocks = migrateImportData(parsedData);
        
        console.log('File import successful:', {
          fileName: importFile.name,
          originalBlocks: parsedData.blocks?.length || 0,
          migratedBlocks: migratedBlocks.length,
          contentPreserved: migratedBlocks.every(b => Object.keys(b.content).length > 0)
        });

        onImport(migratedBlocks);
        setImportFile(null);
        setShowImportDialog(false);

        const migrationInfo = parsedData.version && parsedData.version.startsWith('1.') 
          ? ' (migração automática de v1.x aplicada)' 
          : '';

        toast({
          title: "Importação Concluída",
          description: `${migratedBlocks.length} blocos importados do arquivo com preservação completa${migrationInfo}.`,
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
              Exportar Blocos (Enhanced v2.0.1)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{ color: '#d1d5db' }}>
              Exportar {blocks.length} blocos com preservação completa de conteúdo:
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Mapeamento completo de campos de conteúdo</li>
                <li>Grid layouts responsivos</li>
                <li>Badges customizáveis</li>
                <li>Seções de achados editáveis</li>
                <li>Sistema de cores completo</li>
                <li>Dados de tabela estruturados</li>
                <li>Configurações de enquetes</li>
                <li>Migração automática para versões antigas</li>
              </ul>
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
              Importar Blocos (Enhanced)
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
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#93c5fd' }} />
              <div className="text-xs" style={{ color: '#dbeafe' }}>
                <strong>Preservação Completa:</strong> Sistema aprimorado preserva todo o conteúdo, configurações e estruturas dos blocos durante a importação.
              </div>
            </div>

            <div 
              className="flex items-start gap-2 p-3 rounded"
              style={{ backgroundColor: '#dc2626', borderColor: '#ef4444' }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fca5a5' }} />
              <div className="text-xs" style={{ color: '#fecaca' }}>
                Importar substituirá todos os blocos atuais. Esta ação não pode ser desfeita.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
