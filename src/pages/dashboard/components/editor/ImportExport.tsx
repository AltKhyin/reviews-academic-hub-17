
// ABOUTME: Import/Export component for editor
import React from 'react';
import { ReviewBlock } from '@/types/review';

interface ImportExportProps {
  initialBlocks: ReviewBlock[];
}

export const ImportExport: React.FC<ImportExportProps> = ({ initialBlocks }) => {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
        Import ({initialBlocks.length} blocks)
      </button>
      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
        Export
      </button>
    </div>
  );
};
