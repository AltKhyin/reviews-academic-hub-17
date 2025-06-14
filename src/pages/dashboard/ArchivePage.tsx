
// ABOUTME: Archive page with optimized data fetching and zero visual changes
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useOptimizedArchiveSearch } from '@/hooks/useOptimizedArchiveSearch';
import { useAppNavigation } from '@/hooks/useAppNavigation';

// Define ArchiveIssue interface for compatibility
interface ArchiveIssue {
  id: string;
  title: string;
  cover_image_url?: string;
  specialty: string;
  published_at: string;
  created_at: string;
  authors?: string;
  year?: string;
  score?: number;
  pdf_url: string;
}

const ArchivePage = () => {
  const { navigateToIssue } = useAppNavigation();

  // Use optimized search hook
  const {
    issues,
    totalCount,
    filteredCount,
    specialties,
    years,
    searchQuery,
    selectedTags,
    selectedSpecialty,
    selectedYear,
    setSearchQuery,
    setSelectedTags,
    setSelectedSpecialty,
    setSelectedYear,
    clearAllFilters,
    isLoading,
    error,
  } = useOptimizedArchiveSearch();

  // Results counter text - only show for search queries
  const getResultsText = () => {
    if (searchQuery.trim()) {
      return `${filteredCount} edições encontradas para "${searchQuery}"`;
    }
    return null;
  };

  const resultsText = getResultsText();

  // Convert to expected format for ArchiveHeader (maintain compatibility)
  const parentCategories = specialties; // Simple string array
  const visibleSubtags = years; // Use years as subtags for now
  const hasActiveTagSelection = selectedTags.length > 0 || selectedSpecialty || selectedYear;

  // Simulate tag selection handlers for compatibility
  const handleTagSelect = (tag: string) => {
    if (specialties.includes(tag)) {
      setSelectedSpecialty(selectedSpecialty === tag ? undefined : tag);
    } else if (years.includes(tag)) {
      setSelectedYear(selectedYear === tag ? undefined : tag);
    } else {
      // Handle as regular tag
      const newTags = selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag];
      setSelectedTags(newTags);
    }
  };

  const getTagState = (tag: string): "selected" | "highlighted" | "unselected" => {
    if (selectedSpecialty === tag || selectedYear === tag || selectedTags.includes(tag)) {
      return "selected";
    }
    return "unselected";
  };

  // Convert to ArchiveIssue format (maintain compatibility)
  const archiveIssues: ArchiveIssue[] = issues.map(issue => ({
    ...issue,
    published_at: issue.published_at || new Date().toISOString(),
    created_at: issue.published_at || new Date().toISOString(),
    pdf_url: `/archive/${issue.id}` // Default PDF URL
  }));

  // Handle issue navigation
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
          parentCategories={parentCategories}
          visibleSubtags={visibleSubtags}
          selectedTags={selectedTags}
          hasActiveTagSelection={hasActiveTagSelection}
          isTagsLoading={isLoading}
          onTagSelect={handleTagSelect}
          onClearAllTags={clearAllFilters}
          getTagState={getTagState}
        />
        
        {/* Results counter - only show for search queries */}
        {resultsText && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {resultsText}
            </p>
            {error && (
              <p className="text-sm text-destructive mt-1">
                Erro ao carregar dados. Funcionalidade pode estar limitada.
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
