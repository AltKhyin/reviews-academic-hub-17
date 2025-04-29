
import React from 'react';
import { SplitSquareVertical, BookOpen, FileText } from 'lucide-react';

interface ViewModeSwitcherProps {
  viewMode: 'dual' | 'review' | 'original';
  onViewModeChange: (mode: 'dual' | 'review' | 'original') => void;
  hasOriginal: boolean;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ 
  viewMode, 
  onViewModeChange,
  hasOriginal 
}) => {
  return (
    <div className="flex border-b border-[#2a2a2a] mb-8">
      <button
        onClick={() => onViewModeChange('dual')}
        disabled={!hasOriginal}
        className={`px-4 py-2 text-sm hover-effect flex items-center gap-2 ${
          viewMode === 'dual' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        } ${!hasOriginal ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <SplitSquareVertical size={16} />
        <span>Lado a Lado</span>
      </button>
      <button
        onClick={() => onViewModeChange('review')}
        className={`px-4 py-2 text-sm hover-effect flex items-center gap-2 ${
          viewMode === 'review' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        }`}
      >
        <BookOpen size={16} />
        <span>Revisão</span>
      </button>
      <button
        onClick={() => onViewModeChange('original')}
        disabled={!hasOriginal}
        className={`px-4 py-2 text-sm hover-effect flex items-center gap-2 ${
          viewMode === 'original' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        } ${!hasOriginal ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FileText size={16} />
        <span>Original</span>
      </button>
    </div>
  );
};
