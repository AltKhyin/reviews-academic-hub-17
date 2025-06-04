
import React from 'react';
import { Megaphone, X } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const MiniChangelog: React.FC = () => {
  const { config, isLoadingConfig, changelogHidden, hideChangelog } = useSidebarStore();

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted/30 rounded w-24 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 bg-muted/30 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (changelogHidden || !config?.changelog?.show || !config?.changelog?.entries?.length) {
    return null;
  }

  const recentEntries = config.changelog.entries.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-amber-400/70" />
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Novidades</h3>
        </div>
        <button
          onClick={hideChangelog}
          className="p-1 hover:bg-muted/30 rounded transition-colors"
          aria-label="Ocultar novidades"
        >
          <X className="w-3 h-3 text-muted-foreground/60" />
        </button>
      </div>
      
      <div className="space-y-2">
        {recentEntries.map((entry, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs text-muted-foreground/60">{entry.date}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{entry.text}</p>
            {index < recentEntries.length - 1 && (
              <div className="border-t border-muted/20 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
