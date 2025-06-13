
// ABOUTME: Archive page with coordinated data loading and optimized data flow
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { useArchiveTagReordering } from '@/hooks/useArchiveTagReordering';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

const ArchivePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { navigateToIssue } = useAppNavigation();

  // ARCHITECTURAL FIX: Use coordinated data loading instead of individual API calls
  const {
    data: pageData,
    loading: isDataLoading,
    error: dataError,
    refetch
  } = useStandardizedData.usePageData('/archive');

  // Extract coordinated data
  const allIssues = pageData?.contentData?.issues || [];
  const specialties = pageData?.contentData?.metadata?.specialties || [];
  const years = pageData?.contentData?.metadata?.years || [];

  // PERFORMANCE MONITORING: Track coordination success
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🗄️ Archive: Coordinated loading complete:', {
        issuesCount: allIssues.length,
        specialtiesCount: specialties.length,
        yearsCount: years.length
      });

      // Check for architectural violations
      const violations = architecturalGuards.flagArchitecturalViolations();
      if (violations.length > 0) {
        console.warn('🚨 Archive: Architectural violations detected:', violations);
      }
    }
  }, [allIssues.length, specialties.length, years.length]);

  // Client-side search filtering (coordinated data is already loaded)
  const searchFilteredIssues = React.useMemo(() => {
    if (!searchQuery.trim()) return allIssues;
    
    const query = searchQuery.toLowerCase();
    return allIssues.filter(issue => 
      issue.title?.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query) ||
      issue.specialty?.toLowerCase().includes(query) ||
      issue.authors?.toLowerCase().includes(query)
    );
  }, [allIssues, searchQuery]);

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

  const isLoading = isDataLoading || isTagsLoading;
  const totalCount = allIssues.length;
  const filteredCount = searchFilteredIssues.length;

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

  // Handle data loading errors
  if (dataError && allIssues.length === 0) {
    return (
      <div 
        className="min-h-screen bg-background flex items-center justify-center"
        style={{ backgroundColor: 'hsl(var(--background))' }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar arquivo</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados do arquivo.
          </p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
