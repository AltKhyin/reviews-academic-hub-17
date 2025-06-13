
// ABOUTME: Spacing controls component for customizable block margins and padding
// Provides intuitive UI for adjusting block spacing with live preview

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Lock, Unlock } from 'lucide-react';

interface SpacingControlsProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  block,
  onUpdate
}) => {
  const spacing = block.meta?.spacing || {};
  const margin = spacing.margin || {};
  const padding = spacing.padding || {};

  const [marginLocked, setMarginLocked] = React.useState(false);
  const [paddingLocked, setPaddingLocked] = React.useState(false);

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    let newMargin = { ...margin };
    
    if (marginLocked) {
      // Apply to all sides when locked
      newMargin = {
        top: numValue,
        right: numValue,
        bottom: numValue,
        left: numValue
      };
    } else {
      newMargin[side] = numValue;
    }

    onUpdate({
      meta: {
        ...block.meta,
        spacing: {
          ...spacing,
          margin: newMargin
        }
      }
    });
  };

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    let newPadding = { ...padding };
    
    if (paddingLocked) {
      // Apply to all sides when locked
      newPadding = {
        top: numValue,
        right: numValue,
        bottom: numValue,
        left: numValue
      };
    } else {
      newPadding[side] = numValue;
    }

    onUpdate({
      meta: {
        ...block.meta,
        spacing: {
          ...spacing,
          padding: newPadding
        }
      }
    });
  };

  const resetMargins = () => {
    onUpdate({
      meta: {
        ...block.meta,
        spacing: {
          ...spacing,
          margin: undefined
        }
      }
    });
  };

  const resetPadding = () => {
    onUpdate({
      meta: {
        ...block.meta,
        spacing: {
          ...spacing,
          padding: undefined
        }
      }
    });
  };

  const SpacingInputGroup = ({ 
    title, 
    values, 
    onChange, 
    locked, 
    onLockToggle, 
    onReset 
  }: {
    title: string;
    values: { top?: number; right?: number; bottom?: number; left?: number };
    onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
    locked: boolean;
    onLockToggle: () => void;
    onReset: () => void;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium" style={{ color: '#d1d5db' }}>
          {title}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLockToggle}
            className="h-6 w-6 p-0"
            title={locked ? 'Unlock (edit sides independently)' : 'Lock (edit all sides together)'}
          >
            {locked ? (
              <Lock className="w-3 h-3" style={{ color: '#3b82f6' }} />
            ) : (
              <Unlock className="w-3 h-3" style={{ color: '#9ca3af' }} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 w-6 p-0"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" style={{ color: '#9ca3af' }} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${title.toLowerCase()}-top`} className="text-xs" style={{ color: '#9ca3af' }}>
            Superior
          </Label>
          <Input
            id={`${title.toLowerCase()}-top`}
            type="number"
            min="0"
            max="100"
            value={values.top ?? ''}
            onChange={(e) => onChange('top', e.target.value)}
            placeholder="0"
            className="h-8 text-xs"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
        <div>
          <Label htmlFor={`${title.toLowerCase()}-right`} className="text-xs" style={{ color: '#9ca3af' }}>
            Direita
          </Label>
          <Input
            id={`${title.toLowerCase()}-right`}
            type="number"
            min="0"
            max="100"
            value={values.right ?? ''}
            onChange={(e) => onChange('right', e.target.value)}
            placeholder="0"
            className="h-8 text-xs"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
        <div>
          <Label htmlFor={`${title.toLowerCase()}-bottom`} className="text-xs" style={{ color: '#9ca3af' }}>
            Inferior
          </Label>
          <Input
            id={`${title.toLowerCase()}-bottom`}
            type="number"
            min="0"
            max="100"
            value={values.bottom ?? ''}
            onChange={(e) => onChange('bottom', e.target.value)}
            placeholder="0"
            className="h-8 text-xs"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
        <div>
          <Label htmlFor={`${title.toLowerCase()}-left`} className="text-xs" style={{ color: '#9ca3af' }}>
            Esquerda
          </Label>
          <Input
            id={`${title.toLowerCase()}-left`}
            type="number"
            min="0"
            max="100"
            value={values.left ?? ''}
            onChange={(e) => onChange('left', e.target.value)}
            placeholder="0"
            className="h-8 text-xs"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="spacing-controls space-y-4">
      <SpacingInputGroup
        title="Margem (px)"
        values={margin}
        onChange={handleMarginChange}
        locked={marginLocked}
        onLockToggle={() => setMarginLocked(!marginLocked)}
        onReset={resetMargins}
      />
      
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      
      <SpacingInputGroup
        title="Padding (px)"
        values={padding}
        onChange={handlePaddingChange}
        locked={paddingLocked}
        onLockToggle={() => setPaddingLocked(!paddingLocked)}
        onReset={resetPadding}
      />
      
      <div className="text-xs" style={{ color: '#6b7280' }}>
        <p>Margem controla o espaço externo do bloco.</p>
        <p>Padding controla o espaço interno do bloco.</p>
      </div>
    </div>
  );
};
