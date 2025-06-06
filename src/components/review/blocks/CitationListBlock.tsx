
// ABOUTME: Citation list block for displaying research references and sources
// Handles academic citations with proper formatting and links

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url?: string;
  doi?: string;
  type: 'journal' | 'book' | 'website' | 'other';
}

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
  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  const title = content.title || 'Referências';
  const citations: Citation[] = Array.isArray(content.citations) ? content.citations : [];
  const style = content.style || 'numbered'; // numbered, bulleted, apa
  const showLinks = content.show_links !== false;

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const linkColor = content.link_color || '#3b82f6';

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

  const addCitation = () => {
    const newCitation: Citation = {
      id: `citation_${Date.now()}`,
      title: 'Nova Referência',
      authors: 'Autor et al.',
      journal: 'Journal Name',
      year: new Date().getFullYear().toString(),
      type: 'journal'
    };
    
    handleUpdate('citations', [...citations, newCitation]);
  };

  const updateCitation = (citationId: string, updates: Partial<Citation>) => {
    const updatedCitations = citations.map(citation =>
      citation.id === citationId ? { ...citation, ...updates } : citation
    );
    handleUpdate('citations', updatedCitations);
  };

  const removeCitation = (citationId: string) => {
    const updatedCitations = citations.filter(citation => citation.id !== citationId);
    handleUpdate('citations', updatedCitations);
  };

  const formatCitation = (citation: Citation, index: number) => {
    const prefix = style === 'numbered' ? `${index + 1}.` : '•';
    return `${prefix} ${citation.authors} (${citation.year}). ${citation.title}. ${citation.journal}.`;
  };

  if (readonly) {
    return (
      <div className="citation-list-block my-6">
        <Card 
          className="p-6"
          style={{ 
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            color: textColor
          }}
        >
          {title && (
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              {title}
            </h3>
          )}
          
          {citations.length > 0 ? (
            <div className="space-y-3">
              {citations.map((citation, index) => (
                <div key={citation.id} className="citation-item">
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs"
                      style={{ borderColor: borderColor, color: textColor }}
                    >
                      {citation.type}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed" style={{ color: textColor }}>
                        {formatCitation(citation, index)}
                      </p>
                      {showLinks && (citation.url || citation.doi) && (
                        <div className="flex gap-2 mt-2">
                          {citation.url && (
                            <a 
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs hover:underline"
                              style={{ color: linkColor }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                          {citation.doi && (
                            <a 
                              href={`https://doi.org/${citation.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs hover:underline"
                              style={{ color: linkColor }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              DOI
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
              Nenhuma referência adicionada.
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="citation-list-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card 
        className="p-6"
        style={{ 
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          color: textColor
        }}
      >
        {/* Title Editor */}
        <div className="mb-4">
          <InlineTextEditor
            value={title}
            onChange={(value) => handleUpdate('title', value)}
            className="text-lg font-semibold"
            style={{ color: textColor }}
            placeholder="Título da seção..."
          />
        </div>

        {/* Add Citation Button */}
        <div className="mb-4">
          <Button
            size="sm"
            onClick={addCitation}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Referência
          </Button>
        </div>

        {/* Citations List */}
        {citations.length > 0 ? (
          <div className="space-y-4">
            {citations.map((citation, index) => (
              <Card 
                key={citation.id}
                className="p-4 relative group/citation"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: borderColor
                }}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover/citation:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCitation(citation.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InlineTextEditor
                      value={citation.title}
                      onChange={(value) => updateCitation(citation.id, { title: value })}
                      placeholder="Título do artigo"
                      className="font-medium"
                      style={{ color: textColor }}
                    />
                    <InlineTextEditor
                      value={citation.authors}
                      onChange={(value) => updateCitation(citation.id, { authors: value })}
                      placeholder="Autores"
                      style={{ color: textColor }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <InlineTextEditor
                      value={citation.journal}
                      onChange={(value) => updateCitation(citation.id, { journal: value })}
                      placeholder="Journal/Revista"
                      style={{ color: textColor }}
                    />
                    <InlineTextEditor
                      value={citation.year}
                      onChange={(value) => updateCitation(citation.id, { year: value })}
                      placeholder="Ano"
                      style={{ color: textColor }}
                    />
                    <select
                      value={citation.type}
                      onChange={(e) => updateCitation(citation.id, { type: e.target.value as Citation['type'] })}
                      className="px-3 py-2 rounded border text-sm"
                      style={{ 
                        backgroundColor: '#212121',
                        borderColor: borderColor,
                        color: textColor
                      }}
                    >
                      <option value="journal">Journal</option>
                      <option value="book">Livro</option>
                      <option value="website">Website</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InlineTextEditor
                      value={citation.url || ''}
                      onChange={(value) => updateCitation(citation.id, { url: value })}
                      placeholder="URL (opcional)"
                      style={{ color: textColor }}
                    />
                    <InlineTextEditor
                      value={citation.doi || ''}
                      onChange={(value) => updateCitation(citation.id, { doi: value })}
                      placeholder="DOI (opcional)"
                      style={{ color: textColor }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: textColor, opacity: 0.7 }}>
            Nenhuma referência adicionada. Clique em "Adicionar Referência" para começar.
          </p>
        )}
      </Card>
    </div>
  );
};
