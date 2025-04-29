
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { ChevronLeft } from 'lucide-react';
import { Issue } from '@/types/issue';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsProps {
  isLoading: boolean;
  error: Error | null;
  searchResults: Issue[] | undefined;
  refetch: () => void;
  sortBy: 'relevance' | 'recent' | 'popular';
  setSortBy: (value: 'relevance' | 'recent' | 'popular') => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  filters: Record<string, any>;
  searchTags: { term: string; exclude: boolean }[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  error,
  searchResults,
  refetch,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  clearFilters,
  filters,
  searchTags
}) => {
  return (
    <>
      {/* Sort & View Options */}
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center">
          <span className="text-sm mr-2">Ordenar por:</span>
          <ToggleGroup 
            type="single" 
            value={sortBy} 
            onValueChange={(val) => val && setSortBy(val as 'relevance' | 'recent' | 'popular')}
          >
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
    </>
  );
};
