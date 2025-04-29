
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import Logo from '@/components/common/Logo';
import { 
  HelpCircle, 
  SlidersHorizontal, 
  X, 
  Search,
  Eye, 
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SearchFilter {
  area: string[];
  studyType: string[];
  year: [number, number];
  journal: string[];
  population: string[];
}

interface SearchTag {
  term: string;
  exclude: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_FILTERS: SearchFilter = {
  area: [],
  studyType: [],
  year: [1980, CURRENT_YEAR],
  journal: [],
  population: []
};

const SearchPage: React.FC = () => {
  const [queryText, setQueryText] = useState<string>('');
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
  const [filters, setFilters] = useState<SearchFilter>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [areaSearchText, setAreaSearchText] = useState<string>('');
  
  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 300);
    return () => clearTimeout(timer);
  }, [queryText]);

  // Sample search query for demonstration
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

  const handleFilterChange = (filterType: keyof SearchFilter, value: any) => {
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
      options: ['RCT', 'Coorte', 'Caso-Controle', 'Metanálise', 'Revisão Sistemática']
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
    <div className="container mx-auto py-12">
      {/* Logo centered at the top with extra spacing */}
      <div className="flex justify-center mb-16">
        <Logo dark={false} size="2xlarge" />
      </div>

      <div className="mb-8">
        {/* Search Area */}
        <Card className="p-4">
          <form onSubmit={handleSubmitSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Pesquisa..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Sintaxe: Use termos simples ou aspas para frases exatas.
                        <br /><br />
                        <strong>AND</strong>: Ambos os termos (padrão)
                        <br />
                        <strong>OR</strong>: Qualquer dos termos
                        <br />
                        <strong>NOT</strong>: Excluir termo
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Button type="submit">
              <Search size={18} className="mr-2" />
              Buscar
            </Button>
          </form>

          {/* Search Tags */}
          {searchTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {searchTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant={tag.exclude ? "outline" : "default"}
                  className={`${tag.exclude ? 'border-destructive text-destructive' : ''} flex items-center gap-1 cursor-pointer`}
                >
                  <span onClick={() => handleTagToggleExclude(index)}>
                    {tag.exclude ? 'NOT ' : ''}{tag.term}
                  </span>
                  <button 
                    onClick={() => handleTagRemove(index)} 
                    className="ml-1 hover:bg-gray-700/50 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {searchTags.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                  Limpar
                </Button>
              )}
            </div>
          )}

          {/* Query Preview */}
          {queryPreview && (
            <div className="text-sm text-gray-500 mt-2">
              Query: {queryPreview}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Mobile filters */}
        <div className="block md:hidden col-span-12 mb-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <SlidersHorizontal size={16} className="mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              {/* Sidebar Content for Mobile */}
              <div className="h-full py-4 overflow-y-auto">
                <h3 className="font-bold mb-4">Filtros</h3>
                <SearchSidebar 
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

        {/* Desktop Sidebar */}
        <div className="hidden md:block col-span-3">
          <Card className="p-4">
            <SearchSidebar 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              facetGroups={facetGroups}
              areaSearchText={areaSearchText}
              setAreaSearchText={setAreaSearchText}
              filteredAreaOptions={filteredAreaOptions}
            />
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          {/* Sort & View Options */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-sm mr-2">Ordenar por:</span>
              <ToggleGroup type="single" value={sortBy} onValueChange={(val) => val && setSortBy(val as any)}>
                <ToggleGroupItem value="relevance">Relevância</ToggleGroupItem>
                <ToggleGroupItem value="recent">Recentes</ToggleGroupItem>
                <ToggleGroupItem value="popular">Populares</ToggleGroupItem>
              </ToggleGroup>
            </div>
            {searchResults && (
              <div className="text-sm text-gray-400">
                {searchResults?.length} resultados
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="min-h-[500px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="p-6 text-center bg-red-950/20">
                <p className="text-lg font-medium mb-2">Erro ao buscar artigos</p>
                <p className="mb-4">Ocorreu um erro ao buscar os resultados. Por favor, tente novamente.</p>
                <Button onClick={() => refetch()}>Tentar novamente</Button>
              </Card>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((article: Issue) => (
                  <SearchResultCard key={article.id} article={article} />
                ))}
                
                {/* Pagination */}
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <Button variant="outline" size="icon" className="opacity-50" disabled>
                            <span className="sr-only">Página anterior</span>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        ) : (
                          <PaginationLink onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                            Anterior
                          </PaginationLink>
                        )}
                      </PaginationItem>
                      {[1, 2, 3].map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(prev => prev + 1)}>
                          Próxima
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-lg font-medium mb-2">Nenhum resultado encontrado</p>
                <p className="text-gray-400 mb-4">Tente ajustar seus termos de busca ou remover alguns filtros.</p>
                {(searchTags.length > 0 || Object.values(filters).some(v => 
                  Array.isArray(v) ? v.length > 0 : false
                )) && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpar filtros
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SearchSidebarProps {
  filters: SearchFilter;
  onFilterChange: (filterType: keyof SearchFilter, value: any) => void;
  facetGroups: Record<string, { title: string, options: string[] }>;
  areaSearchText: string;
  setAreaSearchText: (text: string) => void;
  filteredAreaOptions: string[];
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ 
  filters, 
  onFilterChange, 
  facetGroups,
  areaSearchText,
  setAreaSearchText,
  filteredAreaOptions
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Filtros</h3>
      
      <Accordion type="multiple" defaultValue={["studyType"]}>
        {/* Área */}
        <AccordionItem value="area">
          <AccordionTrigger>Área</AccordionTrigger>
          <AccordionContent>
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Buscar áreas..."
                value={areaSearchText}
                onChange={(e) => setAreaSearchText(e.target.value)}
                className="mb-2"
              />
            </div>
            <div className="space-y-2">
              {filteredAreaOptions.map(option => (
                <div key={option} className="flex items-center">
                  <Toggle 
                    pressed={filters.area.includes(option)} 
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        onFilterChange('area', [...filters.area, option]);
                      } else {
                        onFilterChange('area', filters.area.filter(a => a !== option));
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {option} <span className="text-gray-500 ml-1">(24)</span>
                  </Toggle>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Tipo de Estudo - starts expanded */}
        <AccordionItem value="studyType">
          <AccordionTrigger>Tipo de Estudo</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {facetGroups.studyType.options.map(option => (
                <div key={option} className="flex items-center">
                  <Toggle 
                    pressed={filters.studyType.includes(option)} 
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        onFilterChange('studyType', [...filters.studyType, option]);
                      } else {
                        onFilterChange('studyType', filters.studyType.filter(t => t !== option));
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {option} <span className="text-gray-500 ml-1">(15)</span>
                  </Toggle>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Journal */}
        <AccordionItem value="journal">
          <AccordionTrigger>Jornal</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {facetGroups.journal.options.map(option => (
                <div key={option} className="flex items-center">
                  <Toggle 
                    pressed={filters.journal.includes(option)} 
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        onFilterChange('journal', [...filters.journal, option]);
                      } else {
                        onFilterChange('journal', filters.journal.filter(j => j !== option));
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {option} <span className="text-gray-500 ml-1">(18)</span>
                  </Toggle>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Population */}
        <AccordionItem value="population">
          <AccordionTrigger>População</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {facetGroups.population.options.map(option => (
                <div key={option} className="flex items-center">
                  <Toggle 
                    pressed={filters.population.includes(option)} 
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        onFilterChange('population', [...filters.population, option]);
                      } else {
                        onFilterChange('population', filters.population.filter(p => p !== option));
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {option} <span className="text-gray-500 ml-1">(12)</span>
                  </Toggle>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {Object.values(filters).some(v => Array.isArray(v) && v.length > 0) && (
        <Button variant="outline" size="sm" onClick={() => Object.keys(filters).forEach(key => 
          onFilterChange(key as keyof SearchFilter, Array.isArray(DEFAULT_FILTERS[key as keyof SearchFilter]) ? [] : DEFAULT_FILTERS[key as keyof SearchFilter])
        )} className="w-full mt-4">
          Limpar todos os filtros
        </Button>
      )}
    </div>
  );
};

interface SearchResultCardProps {
  article: Issue;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ article }) => {
  // For display purposes, we'll create a fake study type and authors
  const studyType = ["RCT", "Metanálise", "Coorte", "Caso-Controle", "Revisão Sistemática"][Math.floor(Math.random() * 5)];
  const authors = "Smith J, Johnson A, et al.";
  const year = new Date(article.created_at).getFullYear();
  const karma = Math.floor(Math.random() * 100);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4 flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
              {studyType}
            </Badge>
            <span className="text-xs text-gray-400">{year}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{authors}</span>
          </div>
          
          <Link to={`/article/${article.id}`} className="hover:underline">
            <h3 className="font-medium text-lg mb-2">{article.title}</h3>
          </Link>
          
          <p className="text-sm text-gray-400 line-clamp-2">{article.description || "Sem descrição disponível."}</p>
        </div>
        
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-sm font-medium">{karma}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 14-7-7-7 7" />
            </svg>
          </div>
          
          <Link to={`/article/${article.id}`}>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye size={16} className="mr-1" />
              Ver artigo
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SearchPage;
