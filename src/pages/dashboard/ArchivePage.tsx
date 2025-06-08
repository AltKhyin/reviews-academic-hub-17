
// ABOUTME: Archive page with integrated backend tag reordering system and text search
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useSimplifiedArchiveSearch } from '@/hooks/useSimplifiedArchiveSearch';
import { useArchiveTagReordering } from '@/hooks/useArchiveTagReordering';

const ArchivePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Use simplified search for text filtering
  const {
    issues: searchFilteredIssues,
    totalCount,
    filteredCount,
    isLoading: isSearchLoading,
    specialties,
    years,
  } = useSimplifiedArchiveSearch({ searchQuery });

  // Apply tag-based reordering to search-filtered results
  const {
    reorderedIssues,
    parentCategories,
    visibleSubtags,
    selectedTags,
    hasActiveTagSelection,
    isLoading: isTagsLoading,
    error: tagsError,
    handleTagSelect,
    clearAllTags,
    getTagState,
    tagMatchCount,
  } = useArchiveTagReordering(searchFilteredIssues);

  const isLoading = isSearchLoading || isTagsLoading;

  // Results counter text - only show for search queries, not for tag selections
  const getResultsText = () => {
    if (searchQuery.trim()) {
      return `${filteredCount} edições encontradas para "${searchQuery}"`;
    }
    return null;
  };

  const resultsText = getResultsText();

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <ArchiveHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          parentCategories={parentCategories}
          visibleSubtags={visibleSubtags}
          selectedTags={selectedTags}
          hasActiveTagSelection={hasActiveTagSelection}
          isTagsLoading={isTagsLoading}
          onTagSelect={handleTagSelect}
          onClearAllTags={clearAllTags}
          getTagState={getTagState}
        />
        
        {/* Results counter - only show for search queries */}
        {resultsText && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {resultsText}
            </p>
            {tagsError && (
              <p className="text-sm text-destructive mt-1">
                Erro ao carregar categorias. Funcionalidade de reordenação pode estar limitada.
              </p>
            )}
          </div>
        )}
        
        <ResultsGrid
          issues={reorderedIssues}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
