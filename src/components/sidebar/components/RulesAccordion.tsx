
import React, { useEffect } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const RulesAccordion: React.FC = () => {
  const { config, isRulesExpanded, toggleRules, isLoadingConfig } = useSidebarStore();

  // Auto-expand rules on first mobile visit
  useEffect(() => {
    const isMobile = window.innerWidth < 1180;
    const hasVisited = localStorage.getItem('rules-visited');
    
    if (isMobile && !hasVisited && !isRulesExpanded) {
      toggleRules();
      localStorage.setItem('rules-visited', 'true');
    }
  }, [isRulesExpanded, toggleRules]);

  if (isLoadingConfig) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!config?.rules?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggleRules}
        className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
        aria-expanded={isRulesExpanded}
      >
        <span className="text-sm font-medium text-gray-300 group-hover:text-white">
          Regras da Comunidade
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isRulesExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isRulesExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <ul className="space-y-1 text-sm text-gray-300">
            {config.rules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          
          <Link
            to="/community"
            className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors group"
          >
            <span>Ver regras completas</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};
