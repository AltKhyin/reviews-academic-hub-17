
// ABOUTME: Updated archive page with clean UI - removed filtering descriptors to prevent content displacement
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { TagsPanel } from '@/components/archive/TagsPanel';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useOptimizedArchiveSearch } from '@/hooks/useOptimizedArchiveSearch';

const ArchivePage = () => {
  const [filterState, setFilterState] = React.useState({
    searchQuery: '',
    selectedTags: [] as string[],
    specialty: undefined as string | undefined,
    year: undefined as number | undefined,
    sortBy: 'score' as const,
  });

  // Use optimized search with hierarchical backend_tags and scoring
  const {
    issues,
    totalCount,
    filteredCount,
    searchMetrics,
    contextualTags,
    isLoading,
    hasActiveFilters,
    specialties,
    years,
    tagConfig,
  } = useOptimizedArchiveSearch(filterState);

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const selectTag = (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Expanded container width to properly fit columns with minimal spacing */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <ArchiveHeader
          searchQuery={filterState.searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <TagsPanel
          tagConfig={tagConfig}
          selectedTags={filterState.selectedTags}
          contextualTags={contextualTags}
          onTagSelect={selectTag}
        />
        
        {/* Performance metrics and filtering status removed to prevent content displacement */}
        
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
