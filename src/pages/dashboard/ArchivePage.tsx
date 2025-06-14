
// ABOUTME: Archive page with integrated navigation handlers and optimized data flow
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useSimplifiedArchiveSearch } from '@/hooks/useSimplifiedArchiveSearch';
import { useArchiveTagReordering } from '@/hooks/useArchiveTagReordering';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const ArchivePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { navigateToIssue } = useAppNavigation();

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

  // Convert ParentCategory to string array for ArchiveHeader
  const categoryNames = parentCategories.map(cat => cat.name);
  
  // Convert Set to Array for selectedTags
  const selectedTagsArray = Array.from(selectedTags);
  
  // Convert getTagState to match expected signature
  const getTagStateForHeader = (tag: string): "selected" | "highlighted" | "unselected" => {
    const state = getTagState(tag);
    return state.selected ? "selected" : "unselected";
  };

  // Convert Issue[] to ArchiveIssue[] by ensuring published_at is present
  const archiveIssues = reorderedIssues.map(issue => ({
    ...issue,
    published_at: issue.published_at || issue.created_at || new Date().toISOString()
  }));

  // Handle issue navigation using unified NavigationService
  const handleIssueClick = (issueId: string) => {
    console.log('Archive: Navigating to issue:', issueId);
    navigateToIssue(issueId);
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <ArchiveHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          parentCategories={categoryNames}
          visibleSubtags={visibleSubtags}
          selectedTags={selectedTagsArray}
          hasActiveTagSelection={hasActiveTagSelection}
          isTagsLoading={isTagsLoading}
          onTagSelect={handleTagSelect}
          onClearAllTags={clearAllTags}
          getTagState={getTagStateForHeader}
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
          issues={archiveIssues}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onIssueClick={handleIssueClick}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
