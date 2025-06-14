
// ABOUTME: Block type palette component for selecting different block types
import React from 'react';
import { Button } from '@/components/ui/button';
import { BlockType } from '@/types/review';
import { 
  Type, 
  Image, 
  Video, 
  Quote, 
  List, 
  Code, 
  Table, 
  Minus,
  AlertTriangle,
  FileText,
  BarChart,
  Users,
  BookOpen
} from 'lucide-react';

export interface BlockTypeOption {
  id: BlockType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const blockTypes: BlockTypeOption[] = [
  { id: 'text', name: 'Text', icon: <Type className="h-4 w-4" />, description: 'Basic text content' },
  { id: 'heading', name: 'Heading', icon: <Type className="h-4 w-4" />, description: 'Section heading' },
  { id: 'paragraph', name: 'Paragraph', icon: <FileText className="h-4 w-4" />, description: 'Text paragraph' },
  { id: 'image', name: 'Image', icon: <Image className="h-4 w-4" />, description: 'Image with caption' },
  { id: 'video', name: 'Video', icon: <Video className="h-4 w-4" />, description: 'Video embed' },
  { id: 'quote', name: 'Quote', icon: <Quote className="h-4 w-4" />, description: 'Blockquote' },
  { id: 'list', name: 'List', icon: <List className="h-4 w-4" />, description: 'Bulleted or numbered list' },
  { id: 'code', name: 'Code', icon: <Code className="h-4 w-4" />, description: 'Code block' },
  { id: 'table', name: 'Table', icon: <Table className="h-4 w-4" />, description: 'Data table' },
  { id: 'divider', name: 'Divider', icon: <Minus className="h-4 w-4" />, description: 'Section divider' },
  { id: 'callout', name: 'Callout', icon: <AlertTriangle className="h-4 w-4" />, description: 'Highlighted callout' },
  { id: 'chart', name: 'Chart', icon: <BarChart className="h-4 w-4" />, description: 'Data visualization' },
  { id: 'reviewer_quote', name: 'Reviewer Quote', icon: <Users className="h-4 w-4" />, description: 'Expert reviewer quote' },
  { id: 'snapshot_card', name: 'Snapshot Card', icon: <BookOpen className="h-4 w-4" />, description: 'Evidence snapshot' },
];

interface BlockTypePaletteProps {
  onSelectType?: (type: BlockType) => void;
  onAddBlock?: (type: BlockType, position?: number) => void;
  className?: string;
  compact?: boolean;
}

export const BlockTypePalette: React.FC<BlockTypePaletteProps> = ({
  onSelectType,
  onAddBlock,
  className = '',
  compact = false
}) => {
  
  const handleTypeSelect = (type: BlockType) => {
    if (onSelectType) {
      onSelectType(type);
    } else if (onAddBlock) {
      onAddBlock(type);
    }
  };

  return (
    <div className={`block-type-palette ${className}`}>
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-2 p-4`}>
        {blockTypes.map((blockType) => (
          <Button
            key={blockType.id}
            variant="outline"
            className={`flex items-center justify-start space-x-2 ${compact ? 'h-10 text-xs' : 'h-12'} text-left`}
            onClick={() => handleTypeSelect(blockType.id)}
            title={blockType.description}
          >
            {blockType.icon}
            <div className="flex-1">
              <div className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{blockType.name}</div>
              {!compact && (
                <div className="text-xs text-gray-500 truncate">{blockType.description}</div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
