
import React from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const RulesAccordion: React.FC = () => {
  const { config, isLoadingConfig, isRulesExpanded, toggleRules } = useSidebarStore();

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted/50 rounded w-32 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!config?.rules || config.rules.length === 0) {
    return null;
  }

  const visibleRules = isRulesExpanded ? config.rules : config.rules.slice(0, 3);
  const hasMoreRules = config.rules.length > 3;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Regras da Comunidade</h3>
      </div>
      
      <div className="space-y-2">
        {visibleRules.map((rule, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-xs text-muted-foreground mt-0.5 flex-shrink-0">{index + 1}.</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{rule}</p>
          </div>
        ))}
        
        {hasMoreRules && (
          <button
            onClick={toggleRules}
            className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground/80 transition-colors mt-2"
          >
            <span>{isRulesExpanded ? 'Mostrar menos' : `Ver todas (${config.rules.length})`}</span>
            {isRulesExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
