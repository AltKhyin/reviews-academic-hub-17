
// ABOUTME: Citation list block for bibliography and reference management
// Displays formatted citations with automatic numbering and styling

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock } from '@/types/review';
import { FileText, ExternalLink, Calendar } from 'lucide-react';

interface CitationListBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
}

interface Citation {
  id: string;
  authors: string;
  title: string;
  journal?: string;
  year: number;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type: 'article' | 'book' | 'website' | 'conference';
}

export const CitationListBlock: React.FC<CitationListBlockProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const citations: Citation[] = payload.citations || [];
  const style = payload.style || 'apa';
  const numbered = payload.numbered !== false;
  const title = payload.title || 'Referências';

  const formatCitation = (citation: Citation, index: number) => {
    // Basic APA-style formatting
    const prefix = numbered ? `${index + 1}. ` : '';
    const authors = citation.authors;
    const year = citation.year ? `(${citation.year})` : '';
    const title = citation.title;
    const journal = citation.journal ? `${citation.journal}` : '';
    const volume = citation.volume ? `, ${citation.volume}` : '';
    const pages = citation.pages ? `, ${citation.pages}` : '';
    const doi = citation.doi ? ` doi:${citation.doi}` : '';

    return `${prefix}${authors} ${year}. ${title}. ${journal}${volume}${pages}.${doi}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'book':
        return FileText;
      case 'website':
        return ExternalLink;
      case 'conference':
        return Calendar;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return '#3b82f6';
      case 'book':
        return '#10b981';
      case 'website':
        return '#f59e0b';
      case 'conference':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  if (citations.length === 0) {
    return (
      <div className="citation-list-block my-6">
        <Card 
          className="border-dashed border-2"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 mb-4" style={{ color: '#6b7280' }} />
            <p className="text-center" style={{ color: '#9ca3af' }}>
              Nenhuma citação adicionada ainda
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="citation-list-block my-6">
      <Card 
        className="border shadow-sm"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <FileText className="w-5 h-5" style={{ color: '#9ca3af' }} />
            {title}
            <Badge 
              variant="outline" 
              className="ml-auto"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: '#9ca3af',
                color: '#9ca3af'
              }}
            >
              {citations.length} {citations.length === 1 ? 'referência' : 'referências'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {citations.map((citation, index) => {
              const TypeIcon = getTypeIcon(citation.type);
              const typeColor = getTypeColor(citation.type);
              
              return (
                <div 
                  key={citation.id} 
                  className="p-4 rounded-lg border transition-colors hover:bg-gray-800/30"
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a'
                  }}
                >
                  <div className="flex gap-3">
                    {/* Type Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <TypeIcon 
                        className="w-4 h-4" 
                        style={{ color: typeColor }}
                      />
                    </div>
                    
                    {/* Citation Content */}
                    <div className="flex-1 space-y-2">
                      {/* Formatted Citation */}
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: '#d1d5db' }}
                      >
                        {formatCitation(citation, index)}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs" style={{ color: '#9ca3af' }}>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: 'transparent',
                            borderColor: typeColor,
                            color: typeColor
                          }}
                        >
                          {citation.type}
                        </Badge>
                        
                        {citation.year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {citation.year}
                          </span>
                        )}
                        
                        {citation.url && (
                          <a 
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                            style={{ color: '#3b82f6' }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Style Information */}
          <div 
            className="mt-6 pt-4 border-t text-xs text-center"
            style={{ 
              borderColor: '#2a2a2a',
              color: '#6b7280'
            }}
          >
            Formatação: {style.toUpperCase()} • {numbered ? 'Numerada' : 'Sem numeração'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
