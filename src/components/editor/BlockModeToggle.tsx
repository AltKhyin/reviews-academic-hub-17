
// ABOUTME: Block-level edit/preview mode toggle component
// Allows individual blocks to switch between edit and preview modes with consistent colors

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CSS_VARIABLES } from '@/utils/colorSystem';

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
    <div 
      className={cn("flex items-center rounded-md border", className)} 
      style={{ borderColor: CSS_VARIABLES.BORDER_DEFAULT }}
    >
      <Button
        variant={mode === 'edit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('edit')}
        className="rounded-r-none px-2"
        title="Modo de Edição"
        style={mode === 'edit' ? {
          backgroundColor: '#3b82f6',
          color: CSS_VARIABLES.TEXT_PRIMARY
        } : {
          backgroundColor: 'transparent',
          color: CSS_VARIABLES.TEXT_SECONDARY
        }}
      >
        <Edit3 className="w-3 h-3" />
      </Button>
      <Button
        variant={mode === 'preview' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('preview')}
        className="rounded-l-none px-2"
        title="Modo de Visualização"
        style={mode === 'preview' ? {
          backgroundColor: '#3b82f6',
          color: CSS_VARIABLES.TEXT_PRIMARY
        } : {
          backgroundColor: 'transparent',
          color: CSS_VARIABLES.TEXT_SECONDARY
        }}
      >
        <Eye className="w-3 h-3" />
      </Button>
    </div>
  );
};
