
// ABOUTME: Updated archive page using optimized search with hierarchical backend_tags
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
    sortBy: 'newest' as const,
  });

  // Use optimized search with hierarchical backend_tags
  const {
    issues,
    totalCount,
    filteredCount,
    searchMetrics,
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

  // Contextual tags based on current search and hierarchical structure
  const contextualTags = React.useMemo(() => {
    if (!filterState.searchQuery.trim()) return [];
    
    const allTags = Object.values(tagConfig).flat();
    
    return allTags.filter(tag => 
      tag.toLowerCase().includes(filterState.searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [filterState.searchQuery, tagConfig]);

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Expanded container width to properly fit 4 columns with margins */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
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
              <span>Filtered: {filteredCount}</span>
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
