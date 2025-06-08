
// ABOUTME: Enhanced archive page with proper tag hierarchy, search integration, and true masonry grid
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

  // Use optimized search with enhanced tag hierarchy and reordering
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
    setFilterState(prev => {
      const isCurrentlySelected = prev.selectedTags.includes(tag);
      const rootCategories = Object.keys(tagConfig);
      
      if (isCurrentlySelected) {
        // Deselecting a tag
        if (rootCategories.includes(tag)) {
          // If deselecting a root category, also remove its subcategories
          const subcategories = tagConfig[tag] || [];
          return {
            ...prev,
            selectedTags: prev.selectedTags.filter(t => 
              t !== tag && !subcategories.includes(t)
            )
          };
        } else {
          // Just remove the subcategory
          return {
            ...prev,
            selectedTags: prev.selectedTags.filter(t => t !== tag)
          };
        }
      } else {
        // Selecting a tag
        if (rootCategories.includes(tag)) {
          // If selecting a root category, clear other root categories and their subcategories
          const otherRootCategories = rootCategories.filter(r => r !== tag);
          const subcategoriesToRemove = otherRootCategories.flatMap(root => tagConfig[root] || []);
          
          return {
            ...prev,
            selectedTags: [
              ...prev.selectedTags.filter(t => 
                !otherRootCategories.includes(t) && !subcategoriesToRemove.includes(t)
              ),
              tag
            ]
          };
        } else {
          // Selecting a subcategory
          return {
            ...prev,
            selectedTags: [...prev.selectedTags, tag]
          };
        }
      }
    });
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
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
        
        {/* Results counter - only show for search queries, not for tag selections */}
        {filterState.searchQuery.trim() && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {filteredCount} edições encontradas para "{filterState.searchQuery}"
              {filterState.selectedTags.length > 0 && 
                ` em ${filterState.selectedTags.join(', ')}`
              }
            </p>
          </div>
        )}
        
        <ResultsGrid
          issues={issues}
          isLoading={isLoading}
          searchQuery={filterState.searchQuery}
          selectedTags={filterState.selectedTags}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
