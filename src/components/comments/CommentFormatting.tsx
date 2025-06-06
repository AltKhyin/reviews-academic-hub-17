
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Type } from 'lucide-react';

interface CommentFormattingProps {
  onFormat: (format: 'bold' | 'italic' | 'underline') => void;
  isVisible: boolean;
}

export const CommentFormatting: React.FC<CommentFormattingProps> = ({
  onFormat,
  isVisible
}) => {
  if (!isVisible) return null;

  const formatButtons = [
    { type: 'bold' as const, icon: Bold, title: 'Negrito' },
    { type: 'italic' as const, icon: Italic, title: 'Itálico' },
    { type: 'underline' as const, icon: Underline, title: 'Sublinhado' },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-t border-gray-700/30 bg-gray-800/10">
      <Type className="h-3 w-3 text-gray-400 mr-2" />
      {formatButtons.map(({ type, icon: Icon, title }) => (
        <Button
          key={type}
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
          onClick={() => onFormat(type)}
          title={title}
        >
          <Icon className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
};
