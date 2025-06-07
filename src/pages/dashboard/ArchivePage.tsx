
// Centralized archive page with optimized layout and spacing
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { TagsPanel } from '@/components/archive/TagsPanel';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useArchiveData } from '@/hooks/useArchiveData';

const ArchivePage = () => {
  const {
    issues,
    tagConfig,
    filterState,
    isLoading,
    selectTag,
    setSearchQuery
  } = useArchiveData();

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Centralized container with reduced width */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <ArchiveHeader
          searchQuery={filterState.searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <TagsPanel
          tagConfig={tagConfig}
          selectedTags={filterState.selectedTags}
          contextualTags={filterState.contextualTags}
          onTagSelect={selectTag}
        />
        
        <ResultsGrid
          issues={issues}
          isLoading={isLoading}
          searchQuery={filterState.searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
