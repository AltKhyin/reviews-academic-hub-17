
// ABOUTME: Enhanced citation list block with comprehensive academic reference management
// Supports multiple citation styles, DOI integration, and complete bibliographic data

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink,
  Download,
  Search,
  Copy,
  CheckCircle,
  FileText,
  Globe,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'website' | 'other';
  authors: string;
  title: string;
  journal?: string;
  book_title?: string;
  publisher?: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pmid?: string;
  isbn?: string;
  location?: string;
  conference_name?: string;
  editor?: string;
  edition?: string;
  access_date?: string;
  abstract?: string;
  keywords?: string[];
  color?: string;
}

interface CitationListBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

const citationStyles = {
  apa: {
    name: 'APA 7ª edição',
    description: 'American Psychological Association'
  },
  mla: {
    name: 'MLA 9ª edição', 
    description: 'Modern Language Association'
  },
  chicago: {
    name: 'Chicago 17ª edição',
    description: 'Chicago Manual of Style'
  },
  vancouver: {
    name: 'Vancouver',
    description: 'International Committee of Medical Journal Editors'
  },
  abnt: {
    name: 'ABNT NBR 6023',
    description: 'Associação Brasileira de Normas Técnicas'
  },
  harvard: {
    name: 'Harvard',
    description: 'Harvard referencing system'
  }
};

const citationTypes = {
  article: { label: 'Artigo', icon: FileText, fields: ['journal', 'volume', 'issue', 'pages', 'doi', 'pmid'] },
  book: { label: 'Livro', icon: BookOpen, fields: ['publisher', 'location', 'isbn', 'edition'] },
  chapter: { label: 'Capítulo', icon: BookOpen, fields: ['book_title', 'editor', 'publisher', 'location', 'pages'] },
  conference: { label: 'Conferência', icon: Users, fields: ['conference_name', 'location', 'pages'] },
  thesis: { label: 'Tese', icon: FileText, fields: ['publisher', 'location'] },
  website: { label: 'Website', icon: Globe, fields: ['url', 'access_date'] },
  other: { label: 'Outro', icon: FileText, fields: ['publisher', 'location', 'url'] }
};

const sortOptions = {
  alphabetical: 'Alfabética (Autor)',
  year: 'Por Ano',
  type: 'Por Tipo',
  manual: 'Manual'
};

export const CitationListBlock: React.FC<CitationListBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const title = content.title || 'Referências';
  const description = content.description || '';
  const citations: Citation[] = content.citations || [];
  const citationStyle = content.citation_style || 'apa';
  const numbered = content.numbered ?? true;
  const showAbstract = content.show_abstract ?? false;
  const showKeywords = content.show_keywords ?? false;
  const showDoi = content.show_doi ?? true;
  const showUrl = content.show_url ?? true;
  const sortBy = content.sort_by || 'manual';
  const groupByType = content.group_by_type ?? false;
  const showQuickActions = content.show_quick_actions ?? true;
  const allowImport = content.allow_import ?? false;

  // Color system integration
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const titleColor = content.title_color || '#ffffff';
  const textColor = content.text_color || '#d1d5db';
  const accentColor = content.accent_color || '#8b5cf6';
  const linkColor = content.link_color || '#3b82f6';

  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

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

  const handleCitationUpdate = (index: number, field: string, value: any) => {
    const updatedCitations = [...citations];
    updatedCitations[index] = {
      ...updatedCitations[index],
      [field]: value
    };
    handleUpdate('citations', updatedCitations);
  };

  const addCitation = (type: string = 'article') => {
    const newCitation: Citation = {
      id: Date.now().toString(),
      type: type as Citation['type'],
      authors: '',
      title: '',
      year: new Date().getFullYear().toString(),
      color: `hsl(${(citations.length * 137.5) % 360}, 70%, 50%)`
    };
    handleUpdate('citations', [...citations, newCitation]);
  };

  const removeCitation = (index: number) => {
    const updatedCitations = citations.filter((_, i) => i !== index);
    handleUpdate('citations', updatedCitations);
  };

  const moveCitation = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= citations.length) return;
    const newCitations = [...citations];
    const [movedCitation] = newCitations.splice(fromIndex, 1);
    newCitations.splice(toIndex, 0, movedCitation);
    handleUpdate('citations', newCitations);
  };

  const formatCitation = (citation: Citation, index: number): string => {
    const authors = citation.authors || 'Autor não informado';
    const title = citation.title || 'Título não informado';
    const year = citation.year || new Date().getFullYear().toString();

    switch (citationStyle) {
      case 'apa':
        return formatAPA(citation);
      case 'mla':
        return formatMLA(citation);
      case 'chicago':
        return formatChicago(citation);
      case 'vancouver':
        return formatVancouver(citation, index + 1);
      case 'abnt':
        return formatABNT(citation);
      case 'harvard':
        return formatHarvard(citation);
      default:
        return `${authors} (${year}). ${title}.`;
    }
  };

  const formatAPA = (citation: Citation): string => {
    const authors = citation.authors;
    const year = citation.year;
    const title = citation.title;
    
    let result = `${authors} (${year}). ${title}`;
    
    if (citation.type === 'article' && citation.journal) {
      result += `. ${citation.journal}`;
      if (citation.volume) result += `, ${citation.volume}`;
      if (citation.issue) result += `(${citation.issue})`;
      if (citation.pages) result += `, ${citation.pages}`;
    } else if (citation.type === 'book' && citation.publisher) {
      result += `. ${citation.publisher}`;
    }
    
    if (citation.doi) result += `. https://doi.org/${citation.doi}`;
    
    return result + '.';
  };

  const formatMLA = (citation: Citation): string => {
    const authors = citation.authors;
    const title = `"${citation.title}"`;
    
    let result = `${authors}. ${title}`;
    
    if (citation.type === 'article' && citation.journal) {
      result += ` ${citation.journal}`;
      if (citation.volume) result += ` ${citation.volume}`;
      if (citation.issue) result += `.${citation.issue}`;
      result += ` (${citation.year})`;
      if (citation.pages) result += `: ${citation.pages}`;
    }
    
    return result + '.';
  };

  const formatChicago = (citation: Citation): string => {
    return formatAPA(citation); // Simplified for now
  };

  const formatVancouver = (citation: Citation, number: number): string => {
    const authors = citation.authors;
    const title = citation.title;
    
    let result = `${number}. ${authors}. ${title}`;
    
    if (citation.type === 'article' && citation.journal) {
      result += `. ${citation.journal}`;
      if (citation.year) result += `. ${citation.year}`;
      if (citation.volume) result += `;${citation.volume}`;
      if (citation.issue) result += `(${citation.issue})`;
      if (citation.pages) result += `:${citation.pages}`;
    }
    
    return result + '.';
  };

  const formatABNT = (citation: Citation): string => {
    const authors = citation.authors.toUpperCase();
    const title = citation.title;
    
    let result = `${authors}. ${title}`;
    
    if (citation.type === 'article' && citation.journal) {
      result += `. ${citation.journal}`;
      if (citation.location) result += `, ${citation.location}`;
      if (citation.volume) result += `, v. ${citation.volume}`;
      if (citation.issue) result += `, n. ${citation.issue}`;
      if (citation.pages) result += `, p. ${citation.pages}`;
      if (citation.year) result += `, ${citation.year}`;
    }
    
    return result + '.';
  };

  const formatHarvard = (citation: Citation): string => {
    return formatAPA(citation); // Simplified for now
  };

  const copyCitation = async (citation: Citation, index: number) => {
    const formatted = formatCitation(citation, index);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedCitation(citation.id);
      setTimeout(() => setCopiedCitation(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const getSortedCitations = () => {
    let sorted = [...citations];
    
    switch (sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.authors.localeCompare(b.authors));
        break;
      case 'year':
        sorted.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default: // manual
        break;
    }
    
    return sorted;
  };

  const toggleExpanded = (citationId: string) => {
    const newExpanded = new Set(expandedCitations);
    if (newExpanded.has(citationId)) {
      newExpanded.delete(citationId);
    } else {
      newExpanded.add(citationId);
    }
    setExpandedCitations(newExpanded);
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    const sortedCitations = getSortedCitations();
    
    return (
      <div className="citation-list-block my-8">
        <Card className="border shadow-lg" style={cardStyle}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2" style={{ color: titleColor }}>
              <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
              {title}
            </CardTitle>
            
            {description && (
              <p className="text-sm mt-2" style={{ color: textColor, opacity: 0.8 }}>
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs" style={{ color: textColor, opacity: 0.6 }}>
              <span>Estilo: {citationStyles[citationStyle]?.name}</span>
              <span>{citations.length} referência(s)</span>
            </div>
          </CardHeader>
          
          <CardContent>
            {sortedCitations.length > 0 ? (
              <div className="space-y-4">
                {sortedCitations.map((citation, index) => (
                  <div key={citation.id} className="relative">
                    <div className="flex items-start gap-3">
                      {numbered && (
                        <span 
                          className="font-medium mt-1 flex-shrink-0"
                          style={{ color: accentColor }}
                        >
                          [{index + 1}]
                        </span>
                      )}
                      
                      <div className="flex-1">
                        <div 
                          className="text-sm leading-relaxed"
                          style={{ color: textColor }}
                          dangerouslySetInnerHTML={{ 
                            __html: formatCitation(citation, index) 
                          }}
                        />
                        
                        {/* Links */}
                        <div className="flex gap-3 mt-2">
                          {showDoi && citation.doi && (
                            <a 
                              href={`https://doi.org/${citation.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline hover:opacity-80"
                              style={{ color: linkColor }}
                            >
                              DOI: {citation.doi}
                            </a>
                          )}
                          
                          {showUrl && citation.url && (
                            <a 
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline hover:opacity-80 flex items-center gap-1"
                              style={{ color: linkColor }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                          
                          {citation.pmid && (
                            <a 
                              href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline hover:opacity-80"
                              style={{ color: linkColor }}
                            >
                              PMID: {citation.pmid}
                            </a>
                          )}
                        </div>
                        
                        {/* Abstract */}
                        {showAbstract && citation.abstract && (
                          <div className="mt-2 p-2 rounded border-l-2" 
                               style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                            <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>
                              Resumo
                            </div>
                            <div className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
                              {citation.abstract}
                            </div>
                          </div>
                        )}
                        
                        {/* Keywords */}
                        {showKeywords && citation.keywords && citation.keywords.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium mb-1" style={{ color: textColor, opacity: 0.8 }}>
                              Palavras-chave:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {citation.keywords.map((keyword, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ 
                                    backgroundColor: `${accentColor}20`,
                                    color: accentColor
                                  }}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      {showQuickActions && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCitation(citation, index)}
                            className="p-1 h-auto"
                          >
                            {copiedCitation === citation.id ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(citationStyles).map(([key, style]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs opacity-60">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value="article" onValueChange={addCitation}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(citationTypes).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description Editor */}
          <InlineRichTextEditor
            value={description}
            onChange={(value) => handleUpdate('description', value)}
            placeholder="Descrição da bibliografia (opcional)..."
            className="text-sm mt-2"
            style={{ color: textColor, opacity: 0.8 }}
          />
          
          {/* Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="numbered"
                checked={numbered}
                onCheckedChange={(checked) => handleUpdate('numbered', checked)}
              />
              <Label htmlFor="numbered" className="text-xs" style={{ color: textColor }}>
                Numerado
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-abstract"
                checked={showAbstract}
                onCheckedChange={(checked) => handleUpdate('show_abstract', checked)}
              />
              <Label htmlFor="show-abstract" className="text-xs" style={{ color: textColor }}>
                Resumos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-keywords"
                checked={showKeywords}
                onCheckedChange={(checked) => handleUpdate('show_keywords', checked)}
              />
              <Label htmlFor="show-keywords" className="text-xs" style={{ color: textColor }}>
                Palavras-chave
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="group-by-type"
                checked={groupByType}
                onCheckedChange={(checked) => handleUpdate('group_by_type', checked)}
              />
              <Label htmlFor="group-by-type" className="text-xs" style={{ color: textColor }}>
                Agrupar por Tipo
              </Label>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-3">
            <Label className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
              Ordenar por:
            </Label>
            <Select value={sortBy} onValueChange={(value) => handleUpdate('sort_by', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortOptions).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {citations.length > 0 ? (
            <div className="space-y-6">
              {citations.map((citation, index) => {
                const TypeIcon = citationTypes[citation.type]?.icon || FileText;
                const relevantFields = citationTypes[citation.type]?.fields || [];
                const isExpanded = expandedCitations.has(citation.id);
                
                return (
                  <div key={citation.id} className="border rounded-lg p-4 group" style={{ borderColor: borderColor }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4" style={{ color: citation.color || accentColor }} />
                        <span className="font-medium text-sm" style={{ color: textColor }}>
                          {citationTypes[citation.type]?.label} {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {sortBy === 'manual' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCitation(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 h-auto opacity-60 hover:opacity-100"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCitation(index, index + 1)}
                              disabled={index === citations.length - 1}
                              className="p-1 h-auto opacity-60 hover:opacity-100"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(citation.id)}
                          className="p-1 h-auto opacity-60 hover:opacity-100"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCitation(citation, index)}
                          className="p-1 h-auto opacity-60 hover:opacity-100"
                        >
                          {copiedCitation === citation.id ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => removeCitation(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 p-1 h-auto opacity-60 hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                          Tipo
                        </Label>
                        <Select 
                          value={citation.type} 
                          onValueChange={(value) => handleCitationUpdate(index, 'type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(citationTypes).map(([key, type]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                          Ano
                        </Label>
                        <InlineTextEditor
                          value={citation.year}
                          onChange={(value) => handleCitationUpdate(index, 'year', value)}
                          placeholder="2024"
                          className="text-sm mt-1"
                          style={{ color: textColor }}
                        />
                      </div>
                    </div>
                    
                    {/* Authors and Title */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                          Autores
                        </Label>
                        <InlineTextEditor
                          value={citation.authors}
                          onChange={(value) => handleCitationUpdate(index, 'authors', value)}
                          placeholder="Sobrenome, N. M.; Autor, A. B."
                          className="text-sm mt-1"
                          style={{ color: textColor }}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                          Título
                        </Label>
                        <InlineTextEditor
                          value={citation.title}
                          onChange={(value) => handleCitationUpdate(index, 'title', value)}
                          placeholder="Título da obra"
                          className="text-sm mt-1"
                          style={{ color: textColor }}
                        />
                      </div>
                    </div>
                    
                    {/* Type-specific fields */}
                    {relevantFields.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {relevantFields.map(field => (
                          <div key={field}>
                            <Label className="text-xs font-medium capitalize" style={{ color: textColor, opacity: 0.8 }}>
                              {field.replace('_', ' ')}
                            </Label>
                            <InlineTextEditor
                              value={citation[field] || ''}
                              onChange={(value) => handleCitationUpdate(index, field, value)}
                              placeholder={`${field.replace('_', ' ')}`}
                              className="text-sm mt-1"
                              style={{ color: textColor }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Extended fields when expanded */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: borderColor }}>
                        <div>
                          <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                            Resumo
                          </Label>
                          <InlineRichTextEditor
                            value={citation.abstract || ''}
                            onChange={(value) => handleCitationUpdate(index, 'abstract', value)}
                            placeholder="Resumo da obra..."
                            className="text-sm mt-1"
                            style={{ color: textColor }}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                            Palavras-chave (separadas por vírgula)
                          </Label>
                          <InlineTextEditor
                            value={citation.keywords?.join(', ') || ''}
                            onChange={(value) => handleCitationUpdate(index, 'keywords', value.split(',').map(k => k.trim()).filter(Boolean))}
                            placeholder="palavra1, palavra2, palavra3"
                            className="text-sm mt-1"
                            style={{ color: textColor }}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                            Cor do marcador
                          </Label>
                          <Input
                            type="color"
                            value={citation.color || accentColor}
                            onChange={(e) => handleCitationUpdate(index, 'color', e.target.value)}
                            className="w-16 h-8 mt-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Preview */}
                    <div className="mt-4 p-3 rounded border-l-4" 
                         style={{ 
                           backgroundColor: `${citation.color || accentColor}0a`, 
                           borderColor: citation.color || accentColor 
                         }}>
                      <div className="text-xs font-medium mb-1" style={{ color: citation.color || accentColor }}>
                        Preview ({citationStyles[citationStyle]?.name})
                      </div>
                      <div className="text-sm" style={{ color: textColor }}>
                        {numbered && `[${index + 1}] `}
                        {formatCitation(citation, index)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: accentColor, opacity: 0.5 }} />
              <p style={{ color: textColor, opacity: 0.6 }}>
                Nenhuma referência adicionada
              </p>
              <Button onClick={() => addCitation('article')} className="mt-4" variant="outline">
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
