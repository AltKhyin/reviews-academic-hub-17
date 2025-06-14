
// ABOUTME: Native editor component for editing review blocks
import React from 'react';
import { ReviewBlock } from '@/types/review';

interface NativeEditorProps {
  blocks: ReviewBlock[];
  onSave: (blocks: ReviewBlock[]) => void;
  onCancel: () => void;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({ 
  blocks, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="p-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Native Editor</h3>
        <p className="text-gray-600 mb-4">
          Native editor for {blocks.length} blocks coming soon.
        </p>
        <div className="space-x-2">
          <button
            onClick={() => onSave(blocks)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
