
// ABOUTME: Simplified archive page with only text search, no tag filtering system
import React from 'react';
import { ArchiveHeader } from '@/components/archive/ArchiveHeader';
import { ResultsGrid } from '@/components/archive/ResultsGrid';
import { useSimplifiedArchiveSearch } from '@/hooks/useSimplifiedArchiveSearch';

const ArchivePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Use simplified search without tag hierarchy or filtering
  const {
    issues,
    totalCount,
    filteredCount,
    isLoading,
    specialties,
    years,
  } = useSimplifiedArchiveSearch({ searchQuery });

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <ArchiveHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Results counter - only show for search queries */}
        {searchQuery.trim() && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {filteredCount} edições encontradas para "{searchQuery}"
            </p>
          </div>
        )}
        
        <ResultsGrid
          issues={issues}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
