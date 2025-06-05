
// ABOUTME: Content alignment controls for grid blocks
// Provides vertical alignment options for blocks with different heights

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlignStartVertical, AlignCenterVertical, AlignEndVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type VerticalAlignment = 'top' | 'center' | 'bottom';

interface InlineAlignmentControlsProps {
  alignment?: VerticalAlignment;
  onAlignmentChange: (alignment: VerticalAlignment) => void;
  className?: string;
}

export const InlineAlignmentControls: React.FC<InlineAlignmentControlsProps> = ({
  alignment = 'top',
  onAlignmentChange,
  className
}) => {
  const alignmentOptions: { value: VerticalAlignment; icon: React.ReactNode; label: string }[] = [
    { value: 'top', icon: <AlignStartVertical className="w-3 h-3" />, label: 'Topo' },
    { value: 'center', icon: <AlignCenterVertical className="w-3 h-3" />, label: 'Centro' },
    { value: 'bottom', icon: <AlignEndVertical className="w-3 h-3" />, label: 'Inferior' }
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="text-xs text-gray-400 mr-1">Alinhamento:</span>
      {alignmentOptions.map((option) => (
        <Button
          key={option.value}
          variant={alignment === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onAlignmentChange(option.value)}
          className="h-6 w-6 p-0"
          title={option.label}
        >
          {option.icon}
        </Button>
      ))}
    </div>
  );
};
