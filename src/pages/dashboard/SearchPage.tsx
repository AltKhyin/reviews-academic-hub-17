
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/common/Logo';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Card } from '@/components/ui/card';

// Define the main SearchPage component
const SearchPage: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [sortBy, setSortBy] = React.useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [searchTags, setSearchTags] = React.useState<{ term: string; exclude: boolean }[]>([]);
  const [queryText, setQueryText] = React.useState<string>('');
  const [areaSearchText, setAreaSearchText] = React.useState<string>('');
  
  // Define filters state
  const CURRENT_YEAR = new Date().getFullYear();
  const DEFAULT_FILTERS = {
    area: [] as string[],
    studyType: [] as string[],
    year: [1980, CURRENT_YEAR] as [number, number],
    journal: [] as string[],
    population: [] as string[]
  };
  
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 300);
    return () => clearTimeout(timer);
  }, [queryText]);

  // Search query function
  const searchQuery = async () => {
    const query = supabase
      .from('issues')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false });
      
    // Apply filters from searchTags and filters
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  };

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['search', debouncedQuery, searchTags, filters, currentPage, sortBy],
    queryFn: searchQuery
  });

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryText.trim()) {
      setSearchTags(prev => [...prev, { term: queryText.trim(), exclude: false }]);
      setQueryText('');
    }
  };

  const handleTagRemove = (index: number) => {
    setSearchTags(searchTags.filter((_, i) => i !== index));
  };

  const handleTagToggleExclude = (index: number) => {
    setSearchTags(searchTags.map((tag, i) => 
      i === index ? { ...tag, exclude: !tag.exclude } : tag
    ));
  };

  const handleFilterChange = (filterType: keyof typeof DEFAULT_FILTERS, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTags([]);
  };

  // Generate a preview of the search query
  const generateQueryPreview = () => {
    if (searchTags.length === 0) return '';
    
    return searchTags.map(tag => 
      tag.exclude ? `NOT "${tag.term}"` : `"${tag.term}"`
    ).join(' AND ');
  };

  const queryPreview = generateQueryPreview();

  // List of facets to show in sidebar
  const facetGroups = {
    area: {
      title: 'Área',
      options: ['Cardiologia', 'Neurologia', 'Oncologia', 'Pediatria', 'Psiquiatria', 'Nutrição']
    },
    studyType: {
      title: 'Tipo de Estudo',
      options: ['Ensaio Clínico', 'Coorte', 'Caso-Controle', 'Metanálise', 'Revisão Sistemática']
    },
    journal: {
      title: 'Jornal',
      options: ['JAMA', 'The Lancet', 'BMJ', 'NEJM', 'Cochrane']
    },
    population: {
      title: 'População',
      options: ['Adultos', 'Pediátrico', 'Idosos', 'Gestantes']
    }
  };

  // Filter area options based on search
  const filteredAreaOptions = areaSearchText.trim() === '' 
    ? facetGroups.area.options 
    : facetGroups.area.options.filter(option => 
        option.toLowerCase().includes(areaSearchText.toLowerCase())
      );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Logo Header */}
      <header className="h-24 flex items-center justify-center px-6 pt-6">
        <Logo dark={false} size="2xlarge" />
      </header>

      {/* Main layout wrapper - centered vertically and horizontally */}
      <div className="flex-1 flex items-center px-6 py-4">
        {/* Layout with Filters and Search side by side on desktop, stacked on mobile */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Section */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <h3 className="font-medium text-lg mb-2">Filtros</h3>
              <SearchFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                facetGroups={facetGroups}
                areaSearchText={areaSearchText}
                setAreaSearchText={setAreaSearchText}
                filteredAreaOptions={filteredAreaOptions}
              />
            </Card>
          </div>

          {/* Search and Results Section */}
          <div className="md:col-span-3">
            {/* Search Header */}
            <Card className="p-6 mb-6">
              <SearchHeader 
                queryText={queryText}
                setQueryText={setQueryText}
                handleSubmitSearch={handleSubmitSearch}
                searchTags={searchTags}
                handleTagRemove={handleTagRemove}
                handleTagToggleExclude={handleTagToggleExclude}
                clearFilters={clearFilters}
                queryPreview={queryPreview}
              />
            </Card>

            {/* Results area */}
            <SearchResults 
              isLoading={isLoading}
              error={error}
              searchResults={searchResults}
              refetch={refetch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              clearFilters={clearFilters}
              filters={filters}
              searchTags={searchTags}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
