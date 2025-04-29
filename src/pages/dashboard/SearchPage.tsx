
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Toggle } from '@/components/ui/toggle';

const SearchPage: React.FC = () => {
  const [queryText, setQueryText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', queryText, currentPage, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .limit(10);
        
      if (error) throw error;
      return data;
    },
    enabled: false // Don't run query on component mount
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar - fixed */}
      <aside className="w-64 p-6 border-r border-white/10 flex-shrink-0 h-full overflow-auto">
        <h3 className="font-medium text-lg mb-4">Filtros</h3>
        
        <Accordion type="multiple" defaultValue={["tipo"]}>
          {/* Área */}
          <AccordionItem value="area">
            <AccordionTrigger>Área</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {['Cardiologia', 'Neurologia', 'Oncologia', 'Pediatria', 'Psiquiatria'].map(option => (
                  <div key={option} className="flex items-center">
                    <Toggle 
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
          
          {/* Tipo de Estudo */}
          <AccordionItem value="tipo">
            <AccordionTrigger>Tipo de Estudo</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {['Ensaio Clínico', 'Coorte', 'Caso-Controle', 'Metanálise', 'Revisão Sistemática'].map(option => (
                  <div key={option} className="flex items-center">
                    <Toggle 
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
          
          {/* Jornal */}
          <AccordionItem value="jornal">
            <AccordionTrigger>Jornal</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {['JAMA', 'The Lancet', 'BMJ', 'NEJM', 'Cochrane'].map(option => (
                  <div key={option} className="flex items-center">
                    <Toggle 
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
          
          {/* População */}
          <AccordionItem value="populacao">
            <AccordionTrigger>População</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {['Adultos', 'Pediátrico', 'Idosos', 'Gestantes'].map(option => (
                  <div key={option} className="flex items-center">
                    <Toggle 
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
        
        <Button variant="outline" size="sm" className="w-full mt-6">
          Limpar todos os filtros
        </Button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Logo */}
        <div className="flex justify-center mb-14">
          <h1 className="text-9xl font-extrabold">Reviews.</h1>
        </div>
        
        {/* Search input */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Pesquisa..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="bg-gray-900 border-gray-700"
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
        </div>

        {/* Sort options */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm mr-2">Ordenar por:</span>
              <div className="flex rounded-md overflow-hidden border border-gray-700">
                <Button 
                  variant={sortBy === 'relevance' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSortBy('relevance')}
                  className="rounded-none border-r border-gray-700"
                >
                  Relevância
                </Button>
                <Button 
                  variant={sortBy === 'recent' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSortBy('recent')}
                  className="rounded-none border-r border-gray-700"
                >
                  Recentes
                </Button>
                <Button 
                  variant={sortBy === 'popular' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setSortBy('popular')}
                  className="rounded-none"
                >
                  Populares
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              10 resultados
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Example result items */}
              {[1, 2, 3, 4].map(index => (
                <Card key={index} className="p-4 bg-gray-900/50 hover:bg-gray-900 transition-all border-gray-800">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                          {['RCT', 'Caso-Controle', 'Coorte', 'Metanálise'][index % 4]}
                        </Badge>
                        <span className="text-xs text-gray-400">2025</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">Smith J, Johnson A, et al.</span>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-2">Test Issue #{index + 16}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        This is a test and will bug as fuck
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-sm font-medium">{70 + index}</span>
                        <ChevronUp size={16} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
