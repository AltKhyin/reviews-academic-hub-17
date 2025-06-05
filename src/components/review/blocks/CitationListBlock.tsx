
// ABOUTME: Citation list block with full color customization and improved UX
// Complete citation management with color themes and enhanced editing

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink,
  Palette
} from 'lucide-react';

interface Citation {
  id: string;
  authors: string;
  title: string;
  journal: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
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
  const payload = block.payload;
  const title = payload.title || 'Referências';
  const citations = payload.citations || [];
  const citationStyle = payload.citation_style || 'apa';
  const numbered = payload.numbered !== undefined ? payload.numbered : true;
  
  // Color configuration with defaults
  const colors = {
    backgroundColor: payload.backgroundColor || '#1a1a1a',
    borderColor: payload.borderColor || '#2a2a2a',
    titleColor: payload.titleColor || '#ffffff',
    textColor: payload.textColor || '#d1d5db',
    accentColor: payload.accentColor || '#8b5cf6',
    linkColor: payload.linkColor || '#3b82f6'
  };

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const handleColorUpdate = (colorField: string, color: string) => {
    handleUpdate(colorField, color);
  };

  const addCitation = () => {
    const newCitation: Citation = {
      id: Date.now().toString(),
      authors: '',
      title: '',
      journal: '',
      year: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      url: ''
    };
    
    const newCitations = [...citations, newCitation];
    handleUpdate('citations', newCitations);
  };

  const removeCitation = (citationId: string) => {
    const newCitations = citations.filter((citation: Citation) => citation.id !== citationId);
    handleUpdate('citations', newCitations);
  };

  const updateCitation = (citationId: string, field: string, value: string) => {
    const newCitations = citations.map((citation: Citation) => 
      citation.id === citationId 
        ? { ...citation, [field]: value }
        : citation
    );
    handleUpdate('citations', newCitations);
  };

  const formatCitation = (citation: Citation, index: number) => {
    const { authors, title, journal, year, volume, issue, pages, doi } = citation;
    
    switch (citationStyle) {
      case 'apa':
        let formatted = `${authors} (${year}). ${title}. `;
        if (journal) formatted += `*${journal}*`;
        if (volume) formatted += `, ${volume}`;
        if (issue) formatted += `(${issue})`;
        if (pages) formatted += `, ${pages}`;
        if (doi) formatted += `. https://doi.org/${doi}`;
        return formatted;
        
      case 'mla':
        return `${authors}. "${title}" *${journal}*, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.`;
        
      case 'chicago':
        return `${authors}. "${title}" *${journal}* ${volume}, no. ${issue} (${year}): ${pages}.`;
        
      case 'vancouver':
        return `${authors}. ${title}. ${journal}. ${year};${volume}(${issue}):${pages}.`;
        
      default:
        return `${authors}. ${title}. ${journal}. ${year}.`;
    }
  };

  if (readonly) {
    return (
      <div className="citation-list-block my-6">
        <Card 
          className="border shadow-lg"
          style={{ 
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.titleColor }}>
              <BookOpen className="w-5 h-5" style={{ color: colors.accentColor }} />
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {citations.length === 0 ? (
                <p className="text-center italic" style={{ color: colors.textColor }}>
                  Nenhuma citação adicionada
                </p>
              ) : (
                <ol className={numbered ? "list-decimal list-inside space-y-3" : "space-y-3"}>
                  {citations.map((citation: Citation, index: number) => (
                    <li key={citation.id} className="text-sm leading-relaxed" style={{ color: colors.textColor }}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div dangerouslySetInnerHTML={{ 
                            __html: formatCitation(citation, index).replace(/\*(.*?)\*/g, '<em>$1</em>') 
                          }} />
                        </div>
                        {citation.url && (
                          <a 
                            href={citation.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0 hover:opacity-80 transition-opacity"
                            style={{ color: colors.linkColor }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="citation-list-block my-6">
      <Card 
        className="border shadow-lg"
        style={{ 
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor
        }}
      >
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: colors.accentColor }} />
              <span className="font-semibold" style={{ color: colors.titleColor }}>
                Editor de Citações
              </span>
            </div>
            
            {/* Title Editor */}
            <InlineTextEditor
              value={title}
              onChange={(value) => handleUpdate('title', value)}
              placeholder="Título da seção de referências"
              className="text-lg font-semibold"
              style={{ color: colors.titleColor }}
            />
            
            {/* Controls Row */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Citation Style Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm" style={{ color: colors.textColor }}>
                  Estilo:
                </label>
                <Select 
                  value={citationStyle} 
                  onValueChange={(value) => handleUpdate('citation_style', value)}
                >
                  <SelectTrigger 
                    className="w-32"
                    style={{ backgroundColor: colors.backgroundColor, borderColor: colors.borderColor, color: colors.textColor }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }}>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="vancouver">Vancouver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Numbered Toggle */}
              <label className="flex items-center gap-2 text-sm" style={{ color: colors.textColor }}>
                <input
                  type="checkbox"
                  checked={numbered}
                  onChange={(e) => handleUpdate('numbered', e.target.checked)}
                  className="rounded"
                />
                Numeradas
              </label>
            </div>

            {/* Color Customization */}
            <div className="flex items-center gap-4 flex-wrap">
              <Palette className="w-4 h-4" style={{ color: colors.accentColor }} />
              <span className="text-sm" style={{ color: colors.textColor }}>Cores:</span>
              
              <InlineColorPicker
                label="Fundo"
                value={colors.backgroundColor}
                onChange={(color) => handleColorUpdate('backgroundColor', color)}
                readonly={false}
                compact={true}
              />
              
              <InlineColorPicker
                label="Título"
                value={colors.titleColor}
                onChange={(color) => handleColorUpdate('titleColor', color)}
                readonly={false}
                compact={true}
              />
              
              <InlineColorPicker
                label="Texto"
                value={colors.textColor}
                onChange={(color) => handleColorUpdate('textColor', color)}
                readonly={false}
                compact={true}
              />
              
              <InlineColorPicker
                label="Destaque"
                value={colors.accentColor}
                onChange={(color) => handleColorUpdate('accentColor', color)}
                readonly={false}
                compact={true}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Citations List */}
          <div className="space-y-4">
            {citations.map((citation: Citation, index: number) => (
              <Card 
                key={citation.id}
                className="p-4 border"
                style={{ 
                  backgroundColor: `${colors.backgroundColor}dd`,
                  borderColor: colors.borderColor
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: colors.titleColor }}>
                      Citação {index + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCitation(citation.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InlineTextEditor
                      value={citation.authors}
                      onChange={(value) => updateCitation(citation.id, 'authors', value)}
                      placeholder="Autores"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.year}
                      onChange={(value) => updateCitation(citation.id, 'year', value)}
                      placeholder="Ano"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.title}
                      onChange={(value) => updateCitation(citation.id, 'title', value)}
                      placeholder="Título do artigo"
                      className="text-sm md:col-span-2"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.journal}
                      onChange={(value) => updateCitation(citation.id, 'journal', value)}
                      placeholder="Nome da revista"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.volume || ''}
                      onChange={(value) => updateCitation(citation.id, 'volume', value)}
                      placeholder="Volume"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.issue || ''}
                      onChange={(value) => updateCitation(citation.id, 'issue', value)}
                      placeholder="Número"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.pages || ''}
                      onChange={(value) => updateCitation(citation.id, 'pages', value)}
                      placeholder="Páginas"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.doi || ''}
                      onChange={(value) => updateCitation(citation.id, 'doi', value)}
                      placeholder="DOI"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                    <InlineTextEditor
                      value={citation.url || ''}
                      onChange={(value) => updateCitation(citation.id, 'url', value)}
                      placeholder="URL"
                      className="text-sm"
                      style={{ color: colors.textColor }}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="text-xs p-2 rounded border-t"
                    style={{ 
                      backgroundColor: `${colors.backgroundColor}aa`,
                      borderColor: colors.borderColor,
                      color: `${colors.textColor}cc`
                    }}
                  >
                    <strong>Preview:</strong> {formatCitation(citation, index)}
                  </div>
                </div>
              </Card>
            ))}
            
            <Button
              onClick={addCitation}
              variant="outline"
              className="w-full"
              style={{ 
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor,
                color: colors.textColor
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Citação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
