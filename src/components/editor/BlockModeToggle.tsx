
// ABOUTME: Block-level edit/preview mode toggle component
// Allows individual blocks to switch between edit and preview modes

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockModeToggleProps {
  mode: 'edit' | 'preview';
  onModeChange: (mode: 'edit' | 'preview') => void;
  className?: string;
}

export const BlockModeToggle: React.FC<BlockModeToggleProps> = ({
  mode,
  onModeChange,
  className
}) => {
  return (
    <div className={cn("flex items-center rounded-md border", className)} style={{ borderColor: '#2a2a2a' }}>
      <Button
        variant={mode === 'edit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('edit')}
        className="rounded-r-none px-2"
        title="Modo de Edição"
      >
        <Edit3 className="w-3 h-3" />
      </Button>
      <Button
        variant={mode === 'preview' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('preview')}
        className="rounded-l-none px-2"
        title="Modo de Visualização"
      >
        <Eye className="w-3 h-3" />
      </Button>
    </div>
  );
};
