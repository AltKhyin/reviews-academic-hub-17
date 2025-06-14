
// ABOUTME: Wrapper for SnapshotCard, handling editing logic.
import React from 'react';
import { ReviewBlock, SnapshotCardContent as SnapshotCardContentType } from '@/types/review';
import { SnapshotCard } from './SnapshotCard'; // The display component
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button'; // Ensure Button is imported

interface SnapshotCardBlockProps {
  block: ReviewBlock; // Contains content of type SnapshotCardContentType
  onUpdate: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({ block, onUpdate, readonly }) => {
  const content = block.content as SnapshotCardContentType || {};

  const handleChange = (field: keyof SnapshotCardContentType, value: any) => {
    onUpdate({ content: { ...content, [field]: value } });
  };

  if (readonly) {
    return <SnapshotCard content={content} />;
  }

  return (
    <Card className="bg-gray-850 border-gray-700">
      <CardContent className="p-4 space-y-3">
        <div>
          <Label htmlFor={`title-${block.id}`} className="text-gray-300">Title</Label>
          <Input
            id={`title-${block.id}`}
            value={content.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor={`description-${block.id}`} className="text-gray-300">Description</Label>
          <Textarea
            id={`description-${block.id}`}
            value={content.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={3}
          />
        </div>
        {/* Add more editable fields as needed based on SnapshotCardContentType */}
        <div>
          <Label htmlFor={`value-${block.id}`} className="text-gray-300">Value</Label>
          <Input
            id={`value-${block.id}`}
            value={content.value?.toString() || ''}
            onChange={(e) => handleChange('value', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        {/* Add more fields for metrics, source, timestamp etc. */}
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700">
         <p className="text-xs text-gray-500">Live Preview:</p>
         <div className="mt-2 p-2 border border-dashed border-gray-600 rounded">
            <SnapshotCard content={content} />
         </div>
      </CardFooter>
    </Card>
  );
};
