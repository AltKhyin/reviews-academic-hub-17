
// ABOUTME: Updated archive page using optimized search with hierarchical backend_tags and scoring-based ordering
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
    sortBy: 'score' as const, // Changed default to score-based sorting
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
        
        {/* Performance metrics display in development */}
        {process.env.NODE_ENV === 'development' && hasActiveFilters && (
          <div className="mb-4 p-3 bg-muted/20 rounded-lg text-sm text-muted-foreground">
            <div className="flex gap-6">
              <span>Total: {totalCount}</span>
              <span>Showing: {filteredCount}</span>
              {searchMetrics.titleMatches > 0 && <span>Title matches: {searchMetrics.titleMatches}</span>}
              {searchMetrics.authorMatches > 0 && <span>Author matches: {searchMetrics.authorMatches}</span>}
              {searchMetrics.tagMatches > 0 && <span>Tag matches: {searchMetrics.tagMatches}</span>}
            </div>
          </div>
        )}
        
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
