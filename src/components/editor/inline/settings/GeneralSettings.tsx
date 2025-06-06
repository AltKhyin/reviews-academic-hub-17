
// ABOUTME: General block settings panel
// Handles visibility, block info, and block-specific properties

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { BlockSpecificProperties } from '../BlockSpecificProperties';

interface GeneralSettingsProps {
  block: ReviewBlock;
  onContentUpdate: (field: string, value: any) => void;
  onVisibilityToggle: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  block,
  onContentUpdate,
  onVisibilityToggle
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label style={{ color: '#d1d5db' }}>Bloco Visível</Label>
        <div className="flex items-center gap-2">
          {block.visible ? (
            <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
          ) : (
            <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
          )}
          <Switch
            checked={block.visible}
            onCheckedChange={onVisibilityToggle}
            className="scale-75"
          />
        </div>
      </div>
      
      <div className="text-xs" style={{ color: '#6b7280' }}>
        ID: {block.id} • Tipo: {block.type}
      </div>

      <BlockSpecificProperties 
        block={block}
        onContentUpdate={onContentUpdate}
      />
    </div>
  );
};
