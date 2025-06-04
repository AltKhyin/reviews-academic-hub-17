
import React from 'react';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const ResourceBookmarks: React.FC = () => {
  const { config, isLoadingConfig } = useSidebarStore();

  if (isLoadingConfig) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-700 rounded-full w-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!config?.bookmarks?.length) {
    return null;
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'link':
        return <LinkIcon className="w-3 h-3" />;
      case 'external':
        return <ExternalLink className="w-3 h-3" />;
      default:
        return <LinkIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">Links Úteis</h3>
      
      <div className="flex flex-wrap gap-2">
        {config.bookmarks.map((bookmark, index) => {
          const isExternal = bookmark.url.startsWith('http');
          
          return (
            <a
              key={index}
              href={bookmark.url}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 hover:text-white transition-colors group border border-gray-700 hover:border-gray-600"
            >
              {getIcon(bookmark.icon)}
              <span>{bookmark.label}</span>
              {isExternal && (
                <ExternalLink className="w-2 h-2 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};
