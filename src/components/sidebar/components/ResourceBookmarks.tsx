
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
            <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!config?.bookmarks || config.bookmarks.length === 0) {
    return null;
  }

  // Enhanced helper function to clean bookmark labels more thoroughly
  const cleanLabel = (label: string) => {
    return label
      .replace(/\blink\b/gi, '') // Remove "link" (case insensitive)
      .replace(/\blinks\b/gi, '') // Remove "links" (case insensitive)
      .replace(/^\s*[-•·]\s*/, '') // Remove leading dashes or bullet points
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <BookOpen className="w-4 h-4 text-muted-foreground/80" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Links Úteis</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {config.bookmarks.map((bookmark, index) => (
          <a
            key={index}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full flex items-center justify-between px-4 py-3
              bg-muted/40 hover:bg-muted/60
              rounded-md transition-colors group
              text-sm font-semibold text-foreground/90 hover:text-foreground
            "
          >
            <div className="flex items-center space-x-3">
              <span className="text-base">{bookmark.icon}</span>
              <span>{cleanLabel(bookmark.label)}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
