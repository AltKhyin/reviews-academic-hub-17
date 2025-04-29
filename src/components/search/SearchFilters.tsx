
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

interface SearchFilterProps {
  filters: {
    area: string[];
    studyType: string[];
    year: [number, number];
    journal: string[];
    population: string[];
  };
  onFilterChange: (filterType: keyof typeof filters, value: any) => void;
  facetGroups: Record<string, { title: string, options: string[] }>;
  areaSearchText: string;
  setAreaSearchText: (text: string) => void;
  filteredAreaOptions: string[];
}

export const SearchFilters: React.FC<SearchFilterProps> = ({ 
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
        {/* Área - with search box */}
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
          onFilterChange(key as keyof typeof filters, Array.isArray(filters[key as keyof typeof filters]) ? [] : filters[key as keyof typeof filters])
        )} className="w-full mt-4">
          Limpar todos os filtros
        </Button>
      )}
    </div>
  );
};
