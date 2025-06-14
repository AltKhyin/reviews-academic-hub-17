
// ABOUTME: Native editor wrapper for non-fullscreen block editing.
// Integrates BlockEditor for a standard, in-page editing experience.
import React from 'react';
import { BlockEditor, BlockEditorProps } from './BlockEditor';
import { Review } from '@/types/review'; // Ensure Review is exported from types

export interface NativeEditorProps extends Omit<BlockEditorProps, 'readonly' | 'className'> {
  initialReview?: Review;
  onSave: (review: Review) => void;
  containerClassName?: string;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  initialReview,
  onSave,
  containerClassName = 'relative w-full h-full',
}) => {
  return (
    <div className={`native-editor-wrapper ${containerClassName}`}>
      <BlockEditor
        initialReview={initialReview}
        onSave={onSave}
        readonly={false} // Native editor is typically for editing
        className="h-full" // Ensure BlockEditor takes full height of its wrapper
      />
    </div>
  );
};
