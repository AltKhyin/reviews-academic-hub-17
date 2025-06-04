
import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const ResourceBookmarks: React.FC = () => {
  const { config, isLoadingConfig } = useSidebarStore();

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted/30 rounded w-24 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!config?.bookmarks || config.bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <BookOpen className="w-4 h-4 text-muted-foreground/80" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Links Úteis</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {config.bookmarks.map((bookmark, index) => (
          <a
            key={index}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center space-x-1 px-3 py-1.5 
              bg-muted/20 hover:bg-muted/30 
              rounded-full transition-colors group
              text-xs text-muted-foreground hover:text-foreground/90
            "
          >
            <span className="text-xs">{bookmark.icon}</span>
            <span>{bookmark.label}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
};
