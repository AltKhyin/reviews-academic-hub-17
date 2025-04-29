
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle, Eye, X, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type Tag = {
  id: string;
  name: string;
  isExcluded: boolean;
};

type FacetOption = {
  id: string;
  name: string;
  count: number;
  selected: boolean;
  excluded: boolean;
};

type FacetGroup = {
  id: string;
  name: string;
  multiSelect: boolean;
  options: FacetOption[];
};

type SearchResult = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  design: string;
  karma: number;
  journal?: string;
};

const ProcurarPage = () => {
  // States
  const [queryText, setQueryText] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [page, setPage] = useState<number>(1);
  
  // Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Mock facet groups - In a real app, these would come from an API
  useEffect(() => {
    setFacetGroups([
      {
        id: "clinical",
        name: "Área Clínica",
        multiSelect: true,
        options: [
          { id: "cardio", name: "Cardiologia", count: 235, selected: false, excluded: false },
          { id: "neuro", name: "Neurologia", count: 185, selected: false, excluded: false },
          { id: "onco", name: "Oncologia", count: 322, selected: false, excluded: false },
          { id: "psych", name: "Psiquiatria", count: 145, selected: false, excluded: false },
        ]
      },
      {
        id: "studyType",
        name: "Tipo de Estudo",
        multiSelect: true,
        options: [
          { id: "rct", name: "RCT", count: 120, selected: false, excluded: false },
          { id: "meta", name: "Meta-análise", count: 80, selected: false, excluded: false },
          { id: "cohort", name: "Coorte", count: 176, selected: false, excluded: false },
          { id: "systematic", name: "Revisão Sistemática", count: 143, selected: false, excluded: false },
        ]
      },
      {
        id: "year",
        name: "Ano",
        multiSelect: true,
        options: [
          { id: "2020_2025", name: "2020-2025", count: 342, selected: false, excluded: false },
          { id: "2015_2019", name: "2015-2019", count: 285, selected: false, excluded: false },
          { id: "2010_2014", name: "2010-2014", count: 216, selected: false, excluded: false },
          { id: "before_2010", name: "Antes de 2010", count: 478, selected: false, excluded: false },
        ]
      },
      {
        id: "language",
        name: "Idioma",
        multiSelect: false,
        options: [
          { id: "pt", name: "Português", count: 145, selected: false, excluded: false },
          { id: "en", name: "Inglês", count: 1142, selected: false, excluded: false },
          { id: "es", name: "Espanhol", count: 38, selected: false, excluded: false },
        ]
      },
      {
        id: "journal",
        name: "Journal",
        multiSelect: true,
        options: [
          { id: "nejm", name: "NEJM", count: 87, selected: false, excluded: false },
          { id: "lancet", name: "The Lancet", count: 95, selected: false, excluded: false },
          { id: "jama", name: "JAMA", count: 76, selected: false, excluded: false },
          { id: "bmj", name: "BMJ", count: 64, selected: false, excluded: false },
        ]
      },
      {
        id: "population",
        name: "População",
        multiSelect: true,
        options: [
          { id: "adults", name: "Adultos", count: 876, selected: false, excluded: false },
          { id: "pediatric", name: "Pediátrica", count: 235, selected: false, excluded: false },
          { id: "elderly", name: "Idosos", count: 324, selected: false, excluded: false },
        ]
      },
    ]);
  }, []);
  
  // Mock search results - In a real app, this would be replaced by an API call
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock results
      const mockResults: SearchResult[] = Array.from({ length: 10 }, (_, i) => ({
        id: `result-${page}-${i}`,
        title: `Estudo clínico sobre ${queryText || 'terapias'} em pacientes ${i % 2 === 0 ? 'idosos' : 'adultos'}`,
        authors: ['Silva, J.', 'Costa, M.', 'Oliveira, P.'],
        year: 2020 + (i % 5),
        design: i % 4 === 0 ? 'RCT' : i % 4 === 1 ? 'Meta-análise' : i % 4 === 2 ? 'Coorte' : 'Revisão Sistemática',
        karma: 10 + Math.floor(Math.random() * 90),
        journal: i % 3 === 0 ? 'NEJM' : i % 3 === 1 ? 'The Lancet' : 'JAMA'
      }));
      
      if (page === 1) {
        setSearchResults(mockResults);
      } else {
        setSearchResults(prev => [...prev, ...mockResults]);
      }
    } catch (err) {
      setError("Erro ao buscar artigos. Tente novamente.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [queryText, page, tags]);
  
  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      fetchResults();
    }, 300);
    
    return () => clearTimeout(debouncedFetch);
  }, [fetchResults, queryText, tags, sortBy]);
  
  // Set up infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [isLoading]);
  
  // Add tag from input
  const addTag = () => {
    if (!queryText.trim()) return;
    
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: queryText.trim(),
      isExcluded: false
    };
    
    setTags(prev => [...prev, newTag]);
    setQueryText("");
  };
  
  // Remove tag
  const removeTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };
  
  // Toggle tag exclusion
  const toggleTagExclusion = (id: string) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === id ? { ...tag, isExcluded: !tag.isExcluded } : tag
      )
    );
  };
  
  // Toggle facet option
  const toggleFacetOption = (groupId: string, optionId: string, shiftKey: boolean = false) => {
    setFacetGroups(prev => 
      prev.map(group => {
        if (group.id !== groupId) return group;
        
        return {
          ...group,
          options: group.options.map(option => {
            if (option.id !== optionId) {
              // If not multi-select, deselect all other options
              if (!group.multiSelect && option.selected) {
                return { ...option, selected: false, excluded: false };
              }
              return option;
            }
            
            // Toggle between states: none -> selected -> excluded -> none
            if (!option.selected && !option.excluded) {
              return { ...option, selected: true, excluded: false };
            } else if (option.selected && shiftKey) {
              return { ...option, selected: false, excluded: true };
            } else if (option.excluded || (!shiftKey && option.selected)) {
              return { ...option, selected: false, excluded: false };
            }
            
            return option;
          })
        };
      })
    );
    
    // Add selected facet options as tags
    const group = facetGroups.find(g => g.id === groupId);
    const option = group?.options.find(o => o.id === optionId);
    
    if (group && option) {
      // Logic to add/remove tags based on facet selection handled separately
    }
  };
  
  // Generate query preview
  const queryPreview = () => {
    if (tags.length === 0) return "";
    
    // Build a simple query preview
    return tags.map(tag => 
      tag.isExcluded ? `NOT ${tag.name}` : tag.name
    ).join(" AND ");
  };
  
  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Busca Avançada</h1>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Desktop (Zona B) */}
        <div className="hidden md:block col-span-3">
          <FacetsPanel 
            facetGroups={facetGroups} 
            toggleFacetOption={toggleFacetOption}
          />
        </div>
        
        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          {/* Search Bar (Zona A) */}
          <div className="bg-card rounded-lg p-4 mb-6 border">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisa avançada..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full"
                />
              </div>
              
              {/* Help tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sintaxe de busca:</p>
                    <ul className="mt-2">
                      <li><strong>AND</strong>: todos os termos</li>
                      <li><strong>OR</strong>: qualquer termo</li>
                      <li><strong>NOT</strong>: excluir termo</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Mobile Facets Button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] sm:w-[400px]">
                    <h2 className="text-xl font-bold mb-4">Filtros</h2>
                    <FacetsPanel 
                      facetGroups={facetGroups} 
                      toggleFacetOption={toggleFacetOption} 
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            
            {/* Tags/Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant={tag.isExcluded ? "outline" : "default"}
                    className="cursor-pointer"
                    onClick={(e) => toggleTagExclusion(tag.id)}
                  >
                    {tag.isExcluded ? `NÃO ${tag.name}` : tag.name}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 h-4 w-4 p-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Query Preview */}
            {queryPreview() && (
              <div className="text-sm text-muted-foreground">
                Busca: <span className="font-mono">{queryPreview()}</span>
              </div>
            )}
          </div>
          
          {/* Results Sorting and Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} resultados encontrados
            </p>
            
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="karma">Mais upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Results List (Zona C) */}
          <div className="space-y-4">
            {error ? (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                {error}
              </div>
            ) : searchResults.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <p className="text-lg mb-2">Nenhum resultado encontrado.</p>
                <p className="text-muted-foreground">Tente ajustar seus filtros de busca.</p>
              </div>
            ) : (
              <>
                {searchResults.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
                
                {/* Loader for infinite scroll */}
                <div ref={observerTarget} className="py-4 flex justify-center">
                  {isLoading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Facets Panel Component
const FacetsPanel = ({ facetGroups, toggleFacetOption }: { 
  facetGroups: FacetGroup[],
  toggleFacetOption: (groupId: string, optionId: string, shiftKey?: boolean) => void 
}) => {
  const [facetSearch, setFacetSearch] = useState<Record<string, string>>({});
  
  // Filter options based on search
  const getFilteredOptions = (groupId: string, options: FacetOption[]) => {
    const searchTerm = facetSearch[groupId] || '';
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="font-semibold text-lg mb-4">Filtros</h2>
      
      <Accordion type="multiple" className="space-y-2">
        {facetGroups.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="text-base font-medium">{group.name}</span>
            </AccordionTrigger>
            <AccordionContent>
              {/* Search within facet group */}
              <Input 
                placeholder={`Buscar em ${group.name.toLowerCase()}`}
                value={facetSearch[group.id] || ''}
                onChange={(e) => setFacetSearch(prev => ({ 
                  ...prev, 
                  [group.id]: e.target.value 
                }))}
                className="mb-3"
              />
              
              <div className="space-y-1">
                {getFilteredOptions(group.id, group.options).map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <Toggle
                      pressed={option.selected || option.excluded}
                      variant={option.excluded ? "outline" : "default"}
                      className={`w-full justify-between ${option.excluded ? 'opacity-70' : ''}`}
                      onClick={(e) => toggleFacetOption(group.id, option.id, e.shiftKey)}
                    >
                      <span>{option.name}</span>
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    </Toggle>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Search Result Card Component
const SearchResultCard = ({ result }: { result: SearchResult }) => {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-2">
              {result.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-2">
              {result.authors.join(', ')} · {result.year} · {result.journal}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{result.design}</Badge>
              <span className="text-sm text-muted-foreground">⬆️ {result.karma}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="ml-2 shrink-0">
            <Eye className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Visualizar PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcurarPage;
