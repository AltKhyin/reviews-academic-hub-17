
import React from 'react';

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
        className={`px-4 py-2 text-sm hover-effect ${
          viewMode === 'dual' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        } ${!hasOriginal ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Dual view
      </button>
      <button
        onClick={() => onViewModeChange('review')}
        className={`px-4 py-2 text-sm hover-effect ${
          viewMode === 'review' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        }`}
      >
        Review only
      </button>
      <button
        onClick={() => onViewModeChange('original')}
        disabled={!hasOriginal}
        className={`px-4 py-2 text-sm hover-effect ${
          viewMode === 'original' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        } ${!hasOriginal ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Original article
      </button>
    </div>
  );
};
