
// ABOUTME: Citation list block with inline editing
// Displays academic references with proper formatting

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface CitationListBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const CitationListBlock: React.FC<CitationListBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const title = content.title || 'Referências';
  const citations = content.citations || [];
  const citationStyle = content.citation_style || 'apa';
  const numbered = content.numbered ?? true;

  // Color system integration
  const backgroundColor = content.backgroundColor || '#1a1a1a';
  const borderColor = content.borderColor || '#2a2a2a';
  const titleColor = content.titleColor || '#ffffff';
  const textColor = content.textColor || '#d1d5db';
  const accentColor = content.accentColor || '#8b5cf6';
  const linkColor = content.linkColor || '#3b82f6';

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const handleCitationUpdate = (index: number, field: string, value: string) => {
    const updatedCitations = [...citations];
    updatedCitations[index] = {
      ...updatedCitations[index],
      [field]: value
    };
    handleUpdate('citations', updatedCitations);
  };

  const handleUpdateColor = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const addCitation = () => {
    const newCitation = {
      id: Date.now().toString(),
      authors: '',
      title: '',
      journal: '',
      year: '',
      volume: '',
      pages: '',
      doi: '',
      url: ''
    };
    handleUpdate('citations', [...citations, newCitation]);
  };

  const removeCitation = (index: number) => {
    const updatedCitations = citations.filter((_, i) => i !== index);
    handleUpdate('citations', updatedCitations);
  };

  const formatCitation = (citation: any, index: number) => {
    switch (citationStyle) {
      case 'apa':
        return `${citation.authors} (${citation.year}). ${citation.title}. ${citation.journal}, ${citation.volume}, ${citation.pages}.${citation.doi ? ` doi:${citation.doi}` : ''}`;
      case 'mla':
        return `${citation.authors}. "${citation.title}." ${citation.journal} ${citation.volume} (${citation.year}): ${citation.pages}.`;
      case 'chicago':
        return `${citation.authors}. "${citation.title}." ${citation.journal} ${citation.volume} (${citation.year}): ${citation.pages}.`;
      default:
        return `${citation.authors}. ${citation.title}. ${citation.journal}. ${citation.year}.`;
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="citation-list-block my-8">
        <Card className="border shadow-lg" style={cardStyle}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2" style={{ color: titleColor }}>
              <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citations.length > 0 ? (
              <ol className="space-y-4">
                {citations.map((citation: any, index: number) => (
                  <li key={citation.id || index} className="text-sm leading-relaxed">
                    {numbered && (
                      <span className="font-medium mr-2" style={{ color: accentColor }}>
                        [{index + 1}]
                      </span>
                    )}
                    <span style={{ color: textColor }}>
                      {formatCitation(citation, index)}
                    </span>
                    {citation.url && (
                      <a 
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm underline"
                        style={{ color: linkColor }}
                      >
                        [Link]
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center py-8" style={{ color: textColor, opacity: 0.6 }}>
                Nenhuma referência adicionada
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="citation-list-block my-8 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card className="border shadow-lg" style={cardStyle}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
              <InlineTextEditor
                value={title}
                onChange={(value) => handleUpdate('title', value)}
                placeholder="Título da seção"
                className="text-xl font-semibold"
                style={{ color: titleColor }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select 
                value={citationStyle} 
                onValueChange={(value) => handleUpdate('citation_style', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={addCitation} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {citations.length > 0 ? (
            <div className="space-y-6">
              {citations.map((citation: any, index: number) => (
                <div key={citation.id || index} className="border rounded-lg p-4" style={{ borderColor: borderColor }}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-medium" style={{ color: accentColor }}>
                      Referência {index + 1}
                    </span>
                    <Button
                      onClick={() => removeCitation(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InlineTextEditor
                      value={citation.authors || ''}
                      onChange={(value) => handleCitationUpdate(index, 'authors', value)}
                      placeholder="Autores"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.year || ''}
                      onChange={(value) => handleCitationUpdate(index, 'year', value)}
                      placeholder="Ano"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.title || ''}
                      onChange={(value) => handleCitationUpdate(index, 'title', value)}
                      placeholder="Título"
                      className="text-sm md:col-span-2"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.journal || ''}
                      onChange={(value) => handleCitationUpdate(index, 'journal', value)}
                      placeholder="Revista/Journal"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.volume || ''}
                      onChange={(value) => handleCitationUpdate(index, 'volume', value)}
                      placeholder="Volume"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.pages || ''}
                      onChange={(value) => handleCitationUpdate(index, 'pages', value)}
                      placeholder="Páginas"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.doi || ''}
                      onChange={(value) => handleCitationUpdate(index, 'doi', value)}
                      placeholder="DOI"
                      className="text-sm"
                      style={{ color: textColor }}
                    />
                    
                    <InlineTextEditor
                      value={citation.url || ''}
                      onChange={(value) => handleCitationUpdate(index, 'url', value)}
                      placeholder="URL"
                      className="text-sm md:col-span-2"
                      style={{ color: textColor }}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-4 p-3 rounded border-l-4" style={{ backgroundColor: `${accentColor}0a`, borderColor: accentColor }}>
                    <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>
                      Preview ({citationStyle.toUpperCase()})
                    </div>
                    <div className="text-sm" style={{ color: textColor }}>
                      {numbered && `[${index + 1}] `}
                      {formatCitation(citation, index)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: accentColor, opacity: 0.5 }} />
              <p style={{ color: textColor, opacity: 0.6 }}>
                Nenhuma referência adicionada
              </p>
              <Button onClick={addCitation} className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeira referência
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
