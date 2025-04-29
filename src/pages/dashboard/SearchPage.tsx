
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/common/Logo';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

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
    <main className="flex h-screen">
      {/* Sidebar - no overflow */}
      <aside className="hidden md:block w-64 p-4 bg-background/50 border-r">
        <SearchFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          facetGroups={facetGroups}
          areaSearchText={areaSearchText}
          setAreaSearchText={setAreaSearchText}
          filteredAreaOptions={filteredAreaOptions}
        />
      </aside>

      {/* Content with scrollable area */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo Header */}
        <header className="flex-none h-24 flex items-center justify-center">
          <Logo dark={false} size="2xlarge" />
        </header>

        {/* Centered search section */}
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Mobile filters */}
            <div className="block md:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  {/* Sidebar Content for Mobile */}
                  <div className="h-full py-4">
                    <h3 className="font-bold mb-4">Filtros</h3>
                    <SearchFilters 
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      facetGroups={facetGroups}
                      areaSearchText={areaSearchText}
                      setAreaSearchText={setAreaSearchText}
                      filteredAreaOptions={filteredAreaOptions}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Search Header Component */}
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

            {/* Results area - only appears after search */}
            {searchResults && searchResults.length > 0 && (
              <div className="mb-6">
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
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default SearchPage;
