
// ABOUTME: Enhanced import/export manager for native review content with full feature support
// Provides safe import/export with migration support for all editor features including grid layouts

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
    hasGridLayouts: boolean;
    hasCustomBadges: boolean;
    hasFindingSections: boolean;
  };
}

interface LegacyBlock {
  id: number;
  type: string;
  payload: any;
  sort_index: number;
  visible: boolean;
  meta?: any;
  created_at?: string;
  updated_at?: string;
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

  // Migrate legacy data structures to current format
  const migrateLegacyBlock = (legacyBlock: LegacyBlock): ReviewBlock => {
    const block: ReviewBlock = {
      id: legacyBlock.id || -(Date.now() + Math.random()),
      type: legacyBlock.type as any,
      content: legacyBlock.payload || {}, // FIXED: payload -> content
      sort_index: legacyBlock.sort_index || 0,
      visible: legacyBlock.visible !== undefined ? legacyBlock.visible : true,
      meta: legacyBlock.meta || {},
      created_at: legacyBlock.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Migrate snapshot_card legacy structures
    if (block.type === 'snapshot_card' && block.content) {
      // Migrate key_findings to finding_sections
      if (block.content.key_findings && !block.content.finding_sections) {
        block.content.finding_sections = [{
          id: 'migrated_findings',
          label: 'Principais Achados',
          items: block.content.key_findings.map((finding: string, index: number) => ({
            id: `migrated_item_${index}`,
            text: finding,
            color: '#3b82f6'
          }))
        }];
        delete block.content.key_findings;
      }

      // Migrate evidence_level and recommendation_strength to custom_badges
      if ((block.content.evidence_level || block.content.recommendation_strength) && !block.content.custom_badges) {
        const badges: any[] = [];
        
        if (block.content.evidence_level) {
          const evidenceLevels: any = {
            high: { label: 'Alta', color: '#10b981' },
            moderate: { label: 'Moderada', color: '#f59e0b' },
            low: { label: 'Baixa', color: '#ef4444' },
            very_low: { label: 'Muito Baixa', color: '#6b7280' }
          };
          
          const level = evidenceLevels[block.content.evidence_level] || evidenceLevels.moderate;
          badges.push({
            id: 'migrated_evidence_level',
            label: 'Evidência',
            value: level.label,
            color: level.color,
            background_color: 'transparent'
          });
          delete block.content.evidence_level;
        }
        
        if (block.content.recommendation_strength) {
          const recommendationStrengths: any = {
            strong: { label: 'Forte', color: '#10b981' },
            conditional: { label: 'Condicional', color: '#f59e0b' },
            against: { label: 'Contra', color: '#ef4444' }
          };
          
          const strength = recommendationStrengths[block.content.recommendation_strength] || recommendationStrengths.conditional;
          badges.push({
            id: 'migrated_recommendation_strength',
            label: 'Recomendação',
            value: strength.label,
            color: strength.color,
            background_color: 'transparent'
          });
          delete block.content.recommendation_strength;
        }
        
        if (badges.length > 0) {
          block.content.custom_badges = badges;
        }
      }
    }

    return block;
  };

  // Enhanced validation for current data structures
  const validateImportData = (data: any): { valid: boolean; error?: string; blocks?: ReviewBlock[] } => {
    try {
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Dados inválidos: formato JSON incorreto' };
      }

      if (!Array.isArray(data.blocks)) {
        return { valid: false, error: 'Dados inválidos: propriedade "blocks" não encontrada ou não é um array' };
      }

      const migratedBlocks: ReviewBlock[] = [];

      for (let i = 0; i < data.blocks.length; i++) {
        const rawBlock = data.blocks[i];
        
        if (!rawBlock.type || typeof rawBlock.type !== 'string') {
          return { valid: false, error: `Bloco ${i + 1}: tipo inválido ou ausente` };
        }

        // Support both legacy (payload) and current (content) formats
        const hasContent = rawBlock.content && typeof rawBlock.content === 'object';
        const hasPayload = rawBlock.payload && typeof rawBlock.payload === 'object';
        
        if (!hasContent && !hasPayload) {
          return { valid: false, error: `Bloco ${i + 1}: conteúdo inválido ou ausente` };
        }

        // Migrate legacy format if needed
        const migratedBlock = migrateLegacyBlock(rawBlock);
        
        // Validate grid layout metadata if present
        if (migratedBlock.meta?.layout) {
          const layout = migratedBlock.meta.layout;
          if (layout.columns && layout.columns > 4) {
            return { valid: false, error: `Bloco ${i + 1}: layout em grid com mais de 4 colunas não é suportado` };
          }
        }

        migratedBlocks.push(migratedBlock);
      }

      return { valid: true, blocks: migratedBlocks };
    } catch (error) {
      return { valid: false, error: `Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  };

  // Enhanced export with comprehensive metadata
  const handleExport = () => {
    try {
      const metadata = {
        blockCount: blocks.length,
        types: [...new Set(blocks.map(b => b.type))],
        hasGridLayouts: blocks.some(b => b.meta?.layout?.columns && b.meta.layout.columns > 1),
        hasCustomBadges: blocks.some(b => b.content?.custom_badges?.length > 0),
        hasFindingSections: blocks.some(b => b.content?.finding_sections?.length > 0)
      };

      const exportData: ExportData = {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        blocks: blocks.map(block => ({
          ...block,
          // Clean up temporary IDs for export
          id: block.id < 0 ? Math.abs(block.id) : block.id,
          // Ensure updated_at is current
          updated_at: new Date().toISOString()
        })) as ReviewBlock[],
        metadata
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `review-blocks-v2-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação Concluída",
        description: `${blocks.length} blocos exportados com sucesso (v2.0 com suporte completo).`,
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
      const metadata = {
        blockCount: blocks.length,
        types: [...new Set(blocks.map(b => b.type))],
        hasGridLayouts: blocks.some(b => b.meta?.layout?.columns && b.meta.layout.columns > 1),
        hasCustomBadges: blocks.some(b => b.content?.custom_badges?.length > 0),
        hasFindingSections: blocks.some(b => b.content?.finding_sections?.length > 0)
      };

      const exportData: ExportData = {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        blocks,
        metadata
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(jsonData);

      toast({
        title: "Copiado!",
        description: "Dados v2.0 copiados para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  // Import from JSON text with migration
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

      const migrationInfo = parsedData.version && parsedData.version.startsWith('1.') 
        ? ' (migração automática de v1.x aplicada)' 
        : '';

      toast({
        title: "Importação Concluída",
        description: `${validation.blocks?.length || 0} blocos importados com sucesso${migrationInfo}.`,
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

  // Import from file with migration
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

        const migrationInfo = parsedData.version && parsedData.version.startsWith('1.') 
          ? ' (migração automática de v1.x aplicada)' 
          : '';

        toast({
          title: "Importação Concluída",
          description: `${validation.blocks?.length || 0} blocos importados do arquivo${migrationInfo}.`,
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
              Exportar Blocos (v2.0)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{ color: '#d1d5db' }}>
              Exportar {blocks.length} blocos com suporte completo a:
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Grid layouts responsivos</li>
                <li>Badges customizáveis</li>
                <li>Seções de achados editáveis</li>
                <li>Sistema de cores completo</li>
                <li>Migração automática de versões antigas</li>
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
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#93c5fd' }} />
              <div className="text-xs" style={{ color: '#dbeafe' }}>
                <strong>Migração Automática:</strong> Arquivos v1.x serão automaticamente migrados para o formato atual com todas as novas funcionalidades.
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
