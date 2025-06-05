
// ABOUTME: Layout row component for managing multiple blocks in horizontal arrangements
// Provides CSS Grid-based responsive layout with drag & drop support

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { 
  Plus, 
  Columns2, 
  Columns3, 
  Grid3X3,
  Trash2,
  Settings,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: (type: string, position?: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onDuplicateBlock?: (blockId: number) => void;
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  className?: string;
}

interface LayoutConfig {
  columns: number;
  gap: 'sm' | 'md' | 'lg';
  alignment: 'stretch' | 'start' | 'center' | 'end';
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  activeBlockId,
  onActiveBlockChange,
  className = ''
}) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    columns: Math.min(blocks.length, 3),
    gap: 'md',
    alignment: 'stretch'
  });
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  const getGridClasses = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };

    const alignmentClasses = {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
      end: 'items-end'
    };

    return cn(
      'grid',
      columnClasses[layoutConfig.columns as keyof typeof columnClasses] || 'grid-cols-1',
      gapClasses[layoutConfig.gap],
      alignmentClasses[layoutConfig.alignment]
    );
  };

  const handleLayoutChange = (field: keyof LayoutConfig, value: any) => {
    setLayoutConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBlockToRow = () => {
    onAddBlock('paragraph', blocks.length);
  };

  return (
    <Card 
      className={cn("layout-row p-4 space-y-4", className)}
      style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
    >
      {/* Row Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4" style={{ color: '#9ca3af' }} />
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Layout Row - {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Presets */}
          <div className="flex gap-1">
            {[
              { cols: 1, icon: Columns2, label: '1 Coluna' },
              { cols: 2, icon: Columns2, label: '2 Colunas' },
              { cols: 3, icon: Columns3, label: '3 Colunas' },
              { cols: 4, icon: Grid3X3, label: '4 Colunas' }
            ].map(({ cols, icon: Icon, label }) => (
              <Button
                key={cols}
                variant={layoutConfig.columns === cols ? "default" : "ghost"}
                size="sm"
                onClick={() => handleLayoutChange('columns', cols)}
                className="h-7 w-7 p-0"
                title={label}
                style={{
                  backgroundColor: layoutConfig.columns === cols ? '#3b82f6' : 'transparent',
                  color: layoutConfig.columns === cols ? '#ffffff' : '#d1d5db'
                }}
              >
                <Icon className="w-3 h-3" />
              </Button>
            ))}
          </div>

          {/* Settings Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLayoutSettings(!showLayoutSettings)}
            className="h-7 w-7 p-0"
            style={{ color: '#9ca3af' }}
          >
            <Settings className="w-3 h-3" />
          </Button>

          {/* Add Block */}
          <Button
            variant="outline"
            size="sm"
            onClick={addBlockToRow}
            className="h-7 px-2 text-xs flex items-center gap-1"
            style={{ borderColor: '#2a2a2a', color: '#d1d5db' }}
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Layout Settings Panel */}
      {showLayoutSettings && (
        <Card 
          className="p-3 space-y-3"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Gap Control */}
            <div>
              <label className="text-xs" style={{ color: '#d1d5db' }}>
                Espaçamento
              </label>
              <select
                value={layoutConfig.gap}
                onChange={(e) => handleLayoutChange('gap', e.target.value)}
                className="w-full h-7 text-xs rounded border px-2"
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  borderColor: '#2a2a2a', 
                  color: '#ffffff' 
                }}
              >
                <option value="sm">Pequeno</option>
                <option value="md">Médio</option>
                <option value="lg">Grande</option>
              </select>
            </div>

            {/* Alignment Control */}
            <div>
              <label className="text-xs" style={{ color: '#d1d5db' }}>
                Alinhamento
              </label>
              <select
                value={layoutConfig.alignment}
                onChange={(e) => handleLayoutChange('alignment', e.target.value)}
                className="w-full h-7 text-xs rounded border px-2"
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  borderColor: '#2a2a2a', 
                  color: '#ffffff' 
                }}
              >
                <option value="stretch">Esticar</option>
                <option value="start">Início</option>
                <option value="center">Centro</option>
                <option value="end">Fim</option>
              </select>
            </div>

            {/* Columns Control */}
            <div>
              <label className="text-xs" style={{ color: '#d1d5db' }}>
                Colunas
              </label>
              <select
                value={layoutConfig.columns}
                onChange={(e) => handleLayoutChange('columns', parseInt(e.target.value))}
                className="w-full h-7 text-xs rounded border px-2"
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  borderColor: '#2a2a2a', 
                  color: '#ffffff' 
                }}
              >
                <option value={1}>1 Coluna</option>
                <option value={2}>2 Colunas</option>
                <option value={3}>3 Colunas</option>
                <option value={4}>4 Colunas</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Blocks Grid */}
      <div className={getGridClasses()}>
        {blocks.map((block, index) => (
          <div 
            key={block.id} 
            className="layout-block-container"
            style={{ minHeight: '100px' }}
          >
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
          </div>
        ))}
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center"
          style={{ borderColor: '#2a2a2a' }}
        >
          <Plus className="w-8 h-8 mx-auto mb-2" style={{ color: '#9ca3af' }} />
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Esta linha está vazia. Adicione blocos para começar.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addBlockToRow}
            className="mt-2"
          >
            Adicionar Primeiro Bloco
          </Button>
        </div>
      )}
    </Card>
  );
};
