
// Enhanced archive page with refined composition and visual hierarchy
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
      {/* Enhanced container with better spacing */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
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
        />
      </div>
    </div>
  );
};

export default ArchivePage;
