
// ABOUTME: Block type palette component for selecting different block types
import React from 'react';
import { Button } from '@/components/ui/button';
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

export interface BlockType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const blockTypes: BlockType[] = [
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
  onSelectType: (type: string) => void;
  className?: string;
}

export const BlockTypePalette: React.FC<BlockTypePaletteProps> = ({
  onSelectType,
  className = ''
}) => {
  return (
    <div className={`block-type-palette ${className}`}>
      <div className="grid grid-cols-2 gap-2 p-4">
        {blockTypes.map((blockType) => (
          <Button
            key={blockType.id}
            variant="outline"
            className="flex items-center justify-start space-x-2 h-12 text-left"
            onClick={() => onSelectType(blockType.id)}
            title={blockType.description}
          >
            {blockType.icon}
            <div className="flex-1">
              <div className="font-medium text-sm">{blockType.name}</div>
              <div className="text-xs text-gray-500 truncate">{blockType.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
