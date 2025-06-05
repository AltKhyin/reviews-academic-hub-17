
// ABOUTME: Citation list block for displaying bibliography and references
// Renders formatted academic citations with links and metadata

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Copy, BookOpen } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  type: 'journal' | 'book' | 'conference' | 'website' | 'other';
}

interface CitationListPayload {
  title?: string;
  citations: Citation[];
  style: 'apa' | 'vancouver' | 'abnt';
  show_numbers: boolean;
  show_links: boolean;
}

interface CitationListBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const CitationListBlock: React.FC<CitationListBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as CitationListPayload;

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionView?.(block.id.toString());
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'citation_list',
              citation_count: payload.citations?.length || 0,
              style: payload.style,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, onSectionView, payload.citations?.length, payload.style]);

  const formatCitation = (citation: Citation, index: number): string => {
    const authorString = citation.authors.length > 0 
      ? citation.authors.length > 3 
        ? `${citation.authors[0]} et al.`
        : citation.authors.join(', ')
      : 'Autor desconhecido';

    switch (payload.style) {
      case 'apa':
        return `${authorString} (${citation.year}). ${citation.title}. ${citation.journal ? `${citation.journal}` : ''}${citation.volume ? `, ${citation.volume}` : ''}${citation.issue ? `(${citation.issue})` : ''}${citation.pages ? `, ${citation.pages}` : ''}.`;
      
      case 'vancouver':
        return `${index + 1}. ${authorString}. ${citation.title}. ${citation.journal ? `${citation.journal}` : ''}${citation.year ? ` ${citation.year}` : ''}${citation.volume ? `;${citation.volume}` : ''}${citation.issue ? `(${citation.issue})` : ''}${citation.pages ? `:${citation.pages}` : ''}.`;
      
      case 'abnt':
        return `${authorString.toUpperCase()}. ${citation.title}. ${citation.journal ? `${citation.journal}` : ''}${citation.volume ? `, v. ${citation.volume}` : ''}${citation.issue ? `, n. ${citation.issue}` : ''}${citation.pages ? `, p. ${citation.pages}` : ''}${citation.year ? `, ${citation.year}` : ''}.`;
      
      default:
        return `${authorString} (${citation.year}). ${citation.title}. ${citation.journal || 'Unknown source'}.`;
    }
  };

  const handleCitationClick = (citation: Citation) => {
    onInteraction?.(block.id.toString(), 'citation_clicked', {
      citation_id: citation.id,
      citation_type: citation.type,
      has_doi: !!citation.doi,
      has_url: !!citation.url,
      timestamp: Date.now()
    });

    // Open external link if available
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    } else if (citation.doi) {
      window.open(`https://doi.org/${citation.doi}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyCitation = (citation: Citation, index: number) => {
    const formattedCitation = formatCitation(citation, index);
    navigator.clipboard.writeText(formattedCitation);
    
    onInteraction?.(block.id.toString(), 'citation_copied', {
      citation_id: citation.id,
      style: payload.style,
      timestamp: Date.now()
    });
  };

  const getTypeIcon = (type: Citation['type']) => {
    switch (type) {
      case 'journal':
        return <FileText className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: Citation['type']) => {
    switch (type) {
      case 'journal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'book':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'conference':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'website':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!payload.citations || payload.citations.length === 0) {
    return (
      <Card className="citation-list-block border-gray-200 dark:border-gray-700 my-6">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma citação adicionada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            As referências bibliográficas aparecerão aqui quando adicionadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="citation-list-block my-8">
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {payload.title || 'Referências Bibliográficas'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                {payload.citations.length} {payload.citations.length === 1 ? 'referência' : 'referências'}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {payload.style.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {payload.citations.map((citation, index) => (
              <div 
                key={citation.id}
                className="citation-item p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {payload.show_numbers && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(citation.type)}
                        <Badge variant="outline" className={getTypeBadgeColor(citation.type)}>
                          {citation.type}
                        </Badge>
                        {citation.year && (
                          <Badge variant="outline">
                            {citation.year}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCitation(citation, index)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        {payload.show_links && (citation.url || citation.doi) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCitationClick(citation)}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {formatCitation(citation, index)}
                    </div>
                    
                    {/* Additional metadata */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {citation.doi && (
                        <span>DOI: {citation.doi}</span>
                      )}
                      {citation.pmid && (
                        <span>PMID: {citation.pmid}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Citações formatadas no padrão {payload.style.toUpperCase()} • 
              {payload.citations.length} {payload.citations.length === 1 ? 'referência' : 'referências'} listadas
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
