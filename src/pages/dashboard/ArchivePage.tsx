
// ABOUTME: Updated archive page with enhanced tag-based ranking system
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
    sortBy: 'relevance' as const, // Changed default to relevance for better tag-based ordering
  });

  // Use optimized search with enhanced ranking system
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
    contextualTags, // New contextual tags from the hook
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
      {/* Expanded container width to properly fit responsive columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <ArchiveHeader
          searchQuery={filterState.searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <TagsPanel
          tagConfig={tagConfig}
          selectedTags={filterState.selectedTags}
          contextualTags={contextualTags} // Pass contextual tags from hook
          onTagSelect={selectTag}
        />
        
        {/* Performance metrics display in development */}
        {process.env.NODE_ENV === 'development' && hasActiveFilters && (
          <div className="mb-4 p-3 bg-muted/20 rounded-lg text-sm text-muted-foreground">
            <div className="flex gap-6">
              <span>Total: {totalCount}</span>
              <span>Mostrando: {filteredCount}</span>
              {searchMetrics.titleMatches > 0 && <span>Títulos: {searchMetrics.titleMatches}</span>}
              {searchMetrics.authorMatches > 0 && <span>Autores: {searchMetrics.authorMatches}</span>}
              {searchMetrics.tagMatches > 0 && <span>Tags relevantes: {searchMetrics.tagMatches}</span>}
              {filterState.selectedTags.length > 0 && (
                <span className="font-medium">Ordenação: Por relevância aos temas</span>
              )}
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
