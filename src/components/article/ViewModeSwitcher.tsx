
import React from 'react';

interface ViewModeSwitcherProps {
  viewMode: 'dual' | 'review' | 'original';
  onViewModeChange: (mode: 'dual' | 'review' | 'original') => void;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex border-b border-[#2a2a2a] mb-8">
      <button
        onClick={() => onViewModeChange('dual')}
        className={`px-4 py-2 text-sm hover-effect ${viewMode === 'dual' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
      >
        Visualização dual
      </button>
      <button
        onClick={() => onViewModeChange('review')}
        className={`px-4 py-2 text-sm hover-effect ${viewMode === 'review' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
      >
        Apenas revisão
      </button>
      <button
        onClick={() => onViewModeChange('original')}
        className={`px-4 py-2 text-sm hover-effect ${viewMode === 'original' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
      >
        Artigo original
      </button>
    </div>
  );
};
