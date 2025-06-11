
// ABOUTME: Rules accordion sidebar component with default rules
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

export const RulesAccordion: React.FC = () => {
  const { config, isRulesExpanded, toggleRules } = useSidebarStore();
  
  // Default rules if none configured
  const defaultRules = [
    'Mantenha discussões respeitosas e científicas',
    'Cite fontes sempre que possível',
    'Evite spam e autopromoção excessiva',
    'Relate conteúdo inadequado à moderação',
  ];
  
  const rules = config?.rules || defaultRules;

  return (
    <Card className="bg-gray-800/20 border-gray-700/30">
      <CardHeader className="pb-3">
        <button
          onClick={toggleRules}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="flex items-center text-sm font-medium">
            <BookOpen className="h-4 w-4 mr-2" />
            Regras da Comunidade
          </CardTitle>
          {isRulesExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </CardHeader>
      {isRulesExpanded && (
        <CardContent className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-400 text-sm font-medium mt-0.5">
                {index + 1}.
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">{rule}</p>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};
