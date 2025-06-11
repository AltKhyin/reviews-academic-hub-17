
// ABOUTME: Resource bookmarks sidebar component with default content
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, ExternalLink } from 'lucide-react';

export const ResourceBookmarks: React.FC = () => {
  const { config } = useSidebarStore();
  
  // Default bookmarks if none configured
  const defaultBookmarks = [
    { label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/', icon: 'search' },
    { label: 'Cochrane Library', url: 'https://www.cochranelibrary.com/', icon: 'library' },
    { label: 'UpToDate', url: 'https://www.uptodate.com/', icon: 'book' },
  ];
  
  const bookmarks = config?.bookmarks || defaultBookmarks;

  return (
    <Card className="bg-gray-800/20 border-gray-700/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Bookmark className="h-4 w-4 mr-2" />
          Links Úteis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {bookmarks.map((bookmark, index) => (
          <a
            key={index}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 hover:bg-gray-700/30 rounded text-sm transition-colors"
          >
            <span className="text-gray-300">{bookmark.label}</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        ))}
      </CardContent>
    </Card>
  );
};
