
// ABOUTME: Block controls panel with comprehensive editing options and proper TypeScript interfaces
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface BlockControlsProps {
  blockId: string;
  block?: ReviewBlock;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
}

export const BlockControls: React.FC<BlockControlsProps> = ({
  blockId,
  block,
  onUpdateBlock,
  onDeleteBlock
}) => {
  
  if (!block) {
    return (
      <div className="p-4 text-gray-500">
        No block selected
      </div>
    );
  }

  const handleContentUpdate = (field: string, value: any) => {
    onUpdateBlock(blockId, {
      content: {
        ...block.content,
        [field]: value
      }
    });
  };

  const handleVisibilityToggle = () => {
    onUpdateBlock(blockId, {
      visible: !block.visible
    });
  };

  return (
    <div className="block-controls p-4 space-y-4">
      <div className="border-b pb-4">
        <h3 className="font-medium text-gray-900 mb-2">
          {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
        </h3>
        <p className="text-sm text-gray-500">
          Configure this block's properties
        </p>
      </div>

      {/* Content fields based on block type */}
      {(block.type === 'text' || block.type === 'paragraph') && (
        <div>
          <Label htmlFor="text">Text Content</Label>
          <Textarea
            id="text"
            value={block.content?.text || ''}
            onChange={(e) => handleContentUpdate('text', e.target.value)}
            placeholder="Enter text content..."
            rows={4}
          />
        </div>
      )}

      {block.type === 'heading' && (
        <>
          <div>
            <Label htmlFor="title">Heading Text</Label>
            <Input
              id="title"
              value={block.content?.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              placeholder="Enter heading text..."
            />
          </div>
          <div>
            <Label htmlFor="level">Heading Level</Label>
            <select
              id="level"
              value={block.content?.level || 1}
              onChange={(e) => handleContentUpdate('level', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'image' && (
        <>
          <div>
            <Label htmlFor="src">Image URL</Label>
            <Input
              id="src"
              value={block.content?.src || ''}
              onChange={(e) => handleContentUpdate('src', e.target.value)}
              placeholder="Enter image URL..."
            />
          </div>
          <div>
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={block.content?.alt || ''}
              onChange={(e) => handleContentUpdate('alt', e.target.value)}
              placeholder="Enter alt text..."
            />
          </div>
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              value={block.content?.caption || ''}
              onChange={(e) => handleContentUpdate('caption', e.target.value)}
              placeholder="Enter caption..."
            />
          </div>
        </>
      )}

      {/* Visibility toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="visible"
          checked={block.visible}
          onChange={handleVisibilityToggle}
          className="rounded"
        />
        <Label htmlFor="visible">Visible</Label>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t space-y-2">
        <Button
          onClick={() => onDeleteBlock(blockId)}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          Delete Block
        </Button>
      </div>
    </div>
  );
};
