
// ABOUTME: Enhanced block editor with integrated content editing and drag-and-drop
// Provides unified editing experience with inline content manipulation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, Layout } from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockPropertyEditor } from './BlockPropertyEditor';
import { BlockContentEditor } from './BlockContentEditor';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: number) => void;
  compact?: boolean;
}

const blockTypes: { value: BlockType; label: string; description: string }[] = [
  { value: 'heading', label: 'Título', description: 'Títulos e subtítulos' },
  { value: 'paragraph', label: 'Parágrafo', description: 'Texto corrido' },
  { value: 'figure', label: 'Figura', description: 'Imagens com legenda' },
  { value: 'table', label: 'Tabela', description: 'Dados tabulares' },
  { value: 'callout', label: 'Destaque', description: 'Caixas de destaque' },
  { value: 'number_card', label: 'Métrica', description: 'Números destacados' },
  { value: 'reviewer_quote', label: 'Citação', description: 'Comentários de especialistas' },
  { value: 'poll', label: 'Enquete', description: 'Pesquisas interativas' },
  { value: 'divider', label: 'Divisor', description: 'Separador visual' }
];

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  compact = false
}) => {
  const [showProperties, setShowProperties] = useState(true);
  const [newBlockType, setNewBlockType] = useState<BlockType>('paragraph');
  
  const activeBlock = blocks.find(block => block.id === activeBlockId);

  const handleAddBlock = () => {
    const position = activeBlockId 
      ? blocks.findIndex(b => b.id === activeBlockId) + 1 
      : blocks.length;
    onAddBlock(newBlockType, position);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedBlockId = parseInt(e.dataTransfer.getData('text/plain'));
    const dropZone = e.currentTarget as HTMLElement;
    const dropPosition = parseInt(dropZone.dataset.position || '0');
    
    const draggedBlock = blocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) return;

    const currentPosition = blocks.findIndex(b => b.id === draggedBlockId);
    const newPosition = dropPosition > currentPosition ? dropPosition - 1 : dropPosition;
    
    // Move block logic would go here
    console.log(`Moving block ${draggedBlockId} to position ${newPosition}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className={cn("block-editor flex h-full", compact && "text-sm")}>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                Editor de Blocos
              </h2>
              <div 
                className="text-sm px-2 py-1 rounded"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                {blocks.length} blocos
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={newBlockType} onValueChange={(value: BlockType) => setNewBlockType(value)}>
                <SelectTrigger 
                  className="w-48"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {blockTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div style={{ color: '#ffffff' }}>{type.label}</div>
                        <div className="text-xs" style={{ color: '#9ca3af' }}>
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddBlock} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Bloco
              </Button>
            </div>
          </div>

          {/* Block List */}
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <Card 
                className="border-2 border-dashed text-center py-12"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  borderColor: '#2a2a2a'
                }}
              >
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: '#3b82f6' }}>
                      <Plus className="w-6 h-6" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>
                        Nenhum bloco adicionado
                      </h3>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>
                        Comece adicionando um bloco usando o botão acima
                      </p>
                    </div>
                    <Button onClick={handleAddBlock} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Bloco
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="relative">
                  {/* Drop Zone Above */}
                  <div
                    className="h-2 -mb-2 opacity-0 hover:opacity-100 transition-opacity"
                    data-position={index}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                  
                  <BlockContentEditor
                    block={block}
                    isActive={activeBlockId === block.id}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onSelect={onActiveBlockChange}
                    onUpdate={onUpdateBlock}
                    onDelete={onDeleteBlock}
                    onDuplicate={onDuplicateBlock}
                    onMove={onMoveBlock}
                    onAddBlock={onAddBlock}
                  />
                  
                  {/* Drop Zone Below */}
                  {index === blocks.length - 1 && (
                    <div
                      className="h-2 -mt-2 opacity-0 hover:opacity-100 transition-opacity"
                      data-position={blocks.length}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {!compact && showProperties && activeBlock && (
        <div 
          className="w-80 border-l properties-panel overflow-y-auto flex-shrink-0"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                Propriedades
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowProperties(false)}
                style={{ color: '#9ca3af' }}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <BlockPropertyEditor
              block={activeBlock}
              onUpdate={(updates) => onUpdateBlock(activeBlock.id, updates)}
            />
          </div>
        </div>
      )}

      {/* Show Properties Button */}
      {!compact && !showProperties && (
        <div 
          className="w-12 border-l flex items-start justify-center pt-4 flex-shrink-0"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowProperties(true)}
            style={{ color: '#9ca3af' }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
