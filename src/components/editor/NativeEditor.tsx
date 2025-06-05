
// ABOUTME: Enhanced native editor with integrated inline editing and improved UX
// Provides comprehensive block-based content creation with seamless editing experience

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { ResizableLayout } from './ResizableLayout';
import { LivePreview } from './LivePreview';
import { InlineEditingProvider } from './inline/InlineEditingProvider';
import { Save, Eye, RotateCcw, Settings, Layout, Palette, SplitSquareHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeEditorProps {
  issueId?: string;
  initialBlocks: ReviewBlock[];
  onSave: (blocks: ReviewBlock[]) => Promise<void>;
  onCancel: () => void;
  mode?: 'edit' | 'preview' | 'split';
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  issueId,
  initialBlocks,
  onSave,
  onCancel,
  mode = 'edit'
}) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>(mode);
  const [showPalette, setShowPalette] = useState(true);

  // Update blocks when initialBlocks change
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const generateBlockId = useCallback(() => {
    return Math.max(0, ...blocks.map(b => b.id)) + 1;
  }, [blocks]);

  const handleUpdateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updates }
          : block
      )
    );
  }, []);

  const handleDeleteBlock = useCallback((blockId: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.filter(block => block.id !== blockId);
      // Update sort indices
      return newBlocks.map((block, index) => ({ ...block, sort_index: index }));
    });
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
    
    toast({
      title: "Bloco removido",
      description: "O bloco foi removido com sucesso.",
    });
  }, [activeBlockId]);

  const handleMoveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    setBlocks(prevBlocks => {
      const currentIndex = prevBlocks.findIndex(block => block.id === blockId);
      if (currentIndex === -1) return prevBlocks;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prevBlocks.length) return prevBlocks;

      const newBlocks = [...prevBlocks];
      [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
      
      // Update sort indices
      return newBlocks.map((block, index) => ({ ...block, sort_index: index }));
    });
  }, []);

  const handleAddBlock = useCallback((type: BlockType, position?: number) => {
    const newBlockId = generateBlockId();
    const insertPosition = position ?? blocks.length;
    const now = new Date().toISOString();
    
    const newBlock: ReviewBlock = {
      id: newBlockId,
      issue_id: issueId || '',
      type,
      sort_index: insertPosition,
      visible: true,
      payload: getDefaultPayload(type),
      meta: {
        created_at: now,
        updated_at: now
      },
      created_at: now,
      updated_at: now
    };

    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      newBlocks.splice(insertPosition, 0, newBlock);
      
      // Update sort indices for all blocks
      return newBlocks.map((block, index) => ({ ...block, sort_index: index }));
    });

    setActiveBlockId(newBlockId);
    
    toast({
      title: "Bloco adicionado",
      description: `Novo bloco de ${type} foi adicionado.`,
    });
  }, [blocks.length, generateBlockId, issueId]);

  const handleDuplicateBlock = useCallback((blockId: number) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const newBlockId = generateBlockId();
    const position = blocks.findIndex(block => block.id === blockId) + 1;
    const now = new Date().toISOString();
    
    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: newBlockId,
      sort_index: position,
      meta: {
        ...blockToDuplicate.meta,
        created_at: now,
        updated_at: now
      },
      created_at: now,
      updated_at: now
    };

    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      newBlocks.splice(position, 0, duplicatedBlock);
      
      // Update sort indices
      return newBlocks.map((block, index) => ({ ...block, sort_index: index }));
    });

    setActiveBlockId(newBlockId);
    
    toast({
      title: "Bloco duplicado",
      description: "O bloco foi duplicado com sucesso.",
    });
  }, [blocks, generateBlockId]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(blocks);
      setHasUnsavedChanges(false);
      toast({
        title: "Conteúdo salvo",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [blocks, onSave, isSaving]);

  const handleDiscard = useCallback(() => {
    setBlocks(initialBlocks);
    setActiveBlockId(null);
    setHasUnsavedChanges(false);
    toast({
      title: "Alterações descartadas",
      description: "Todas as alterações foram descartadas.",
    });
  }, [initialBlocks]);

  const handleInlineChanges = useCallback((changes: Map<string, any>) => {
    // Auto-save inline changes
    changes.forEach((value, editorId) => {
      const [blockId, field] = editorId.split('.');
      if (blockId && field) {
        handleUpdateBlock(parseInt(blockId), { [field]: value });
      }
    });
  }, [handleUpdateBlock]);

  // Create editor content
  const editorContent = (
    <div className="h-full flex">
      {/* Left Sidebar - Block Palette */}
      {showPalette && (
        <div 
          className="w-80 border-r flex-shrink-0 overflow-hidden"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <BlockPalette onAddBlock={handleAddBlock} />
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        <BlockEditor
          blocks={blocks}
          activeBlockId={activeBlockId}
          onActiveBlockChange={setActiveBlockId}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onAddBlock={handleAddBlock}
          onDuplicateBlock={handleDuplicateBlock}
          compact={!showPalette}
        />
      </div>
    </div>
  );

  // Create preview content
  const previewContent = (
    <LivePreview
      blocks={blocks}
      activeBlockId={activeBlockId}
      onBlockUpdate={handleUpdateBlock}
    />
  );

  return (
    <InlineEditingProvider onSave={handleInlineChanges}>
      <div className="native-editor h-full flex flex-col" style={{ backgroundColor: '#121212' }}>
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
              Editor Nativo
            </h1>
            {hasUnsavedChanges && (
              <div 
                className="text-sm px-2 py-1 rounded"
                style={{ backgroundColor: '#f59e0b', color: '#000000' }}
              >
                Alterações não salvas
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPalette(!showPalette)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              {showPalette ? 'Ocultar' : 'Mostrar'} Paleta
            </Button>

            <div className="flex items-center border rounded-md" style={{ borderColor: '#2a2a2a' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('edit')}
                className={cn(
                  "h-8 px-3 rounded-r-none text-xs",
                  viewMode === 'edit' && "bg-blue-600 text-white"
                )}
              >
                <Settings className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('split')}
                className={cn(
                  "h-8 px-3 rounded-none border-x text-xs",
                  viewMode === 'split' && "bg-blue-600 text-white"
                )}
                style={{ borderColor: '#2a2a2a' }}
              >
                <SplitSquareHorizontal className="w-3 h-3 mr-1" />
                Dividir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('preview')}
                className={cn(
                  "h-8 px-3 rounded-l-none text-xs",
                  viewMode === 'preview' && "bg-blue-600 text-white"
                )}
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
            </div>

            {hasUnsavedChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Descartar
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'edit' && editorContent}
          {viewMode === 'preview' && previewContent}
          {viewMode === 'split' && (
            <ResizableLayout
              leftPanel={editorContent}
              rightPanel={previewContent}
              leftTitle="Editor"
              rightTitle="Preview ao Vivo"
              defaultLayout={[60, 40]}
              minLeftSize={25}
              minRightSize={25}
            />
          )}
        </div>
      </div>
    </InlineEditingProvider>
  );
};

// Helper function to generate default payload for different block types
function getDefaultPayload(type: BlockType): any {
  switch (type) {
    case 'heading':
      return { text: '', level: 1, anchor: '' };
    case 'paragraph':
      return { content: '', alignment: 'left', emphasis: 'normal' };
    case 'figure':
      return { src: '', alt: '', caption: '', width: 'auto', alignment: 'center' };
    case 'table':
      return { 
        title: '', 
        headers: ['Coluna 1', 'Coluna 2'], 
        rows: [['Dados 1', 'Dados 2']], 
        caption: '' 
      };
    case 'callout':
      return { type: 'info', title: '', content: '' };
    case 'number_card':
      return { number: '0', label: 'Métrica', description: '', trend: 'neutral', percentage: 0 };
    case 'reviewer_quote':
      return { quote: '', author: '', title: '', institution: '', avatar_url: '' };
    case 'poll':
      return { 
        question: '', 
        options: ['Opção 1', 'Opção 2'], 
        poll_type: 'single_choice',
        votes: [0, 0],
        total_votes: 0,
        allow_add_options: false
      };
    case 'citation_list':
      return { citations: [] };
    default:
      return {};
  }
}
