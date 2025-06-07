
// Main archive page component
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
      className="min-h-screen p-6 lg:p-8"
      style={{ backgroundColor: '#121212' }}
    >
      <div className="max-w-7xl mx-auto">
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
