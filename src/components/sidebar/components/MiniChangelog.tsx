
import React, { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const MiniChangelog: React.FC = () => {
  const { config, changelogHidden, hideChangelog, isLoadingConfig } = useSidebarStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!config?.changelog?.show || changelogHidden) {
      setIsVisible(false);
      return;
    }

    // Check localStorage for hidden status
    const hiddenUntil = localStorage.getItem('hideChangelogUntil');
    if (hiddenUntil && new Date(hiddenUntil) > new Date()) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [config, changelogHidden]);

  const handleClose = () => {
    // Hide for 7 days
    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + 7);
    localStorage.setItem('hideChangelogUntil', hideUntil.toISOString());
    
    hideChangelog();
    setIsVisible(false);
  };

  if (isLoadingConfig || !isVisible || !config?.changelog?.entries?.length) {
    return null;
  }

  const recentEntries = config.changelog.entries.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-gray-300">Novidades</h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          aria-label="Fechar novidades"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      
      <div className="p-3 bg-gradient-to-br from-green-900/10 to-blue-900/10 border border-green-500/20 rounded-lg space-y-2">
        {recentEntries.map((entry, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-green-400">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">{entry.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
