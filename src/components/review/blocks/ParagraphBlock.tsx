
// ABOUTME: Rich text paragraph block with citation support and inline editing
// Renders formatted content with inline citations and proper typography

import React, { useEffect, useState } from 'react';
import { ReviewBlock, ParagraphPayload } from '@/types/review';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Palette, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParagraphBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload as ParagraphPayload;
  const [isEditing, setIsEditing] = useState(false);
  const [showStyleControls, setShowStyleControls] = useState(false);

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'paragraph',
              has_citations: !!(payload.citations && payload.citations.length > 0),
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
  }, [block.id, onInteraction, payload.citations]);

  // Process content to handle citations
  const processContent = (content: string) => {
    if (!payload.citations || payload.citations.length === 0) {
      return content;
    }

    // Replace citation placeholders with proper citation links
    let processedContent = content;
    payload.citations.forEach((citation, index) => {
      const citationRegex = new RegExp(`\\[${citation}\\]`, 'g');
      processedContent = processedContent.replace(
        citationRegex,
        `<sup class="citation-link cursor-pointer text-blue-600 hover:text-blue-800 font-medium" data-citation="${citation}" title="Clique para ver a referência">[${index + 1}]</sup>`
      );
    });

    return processedContent;
  };

  const handleCitationClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('citation-link')) {
      const citation = target.getAttribute('data-citation');
      if (citation) {
        onInteraction?.(block.id.toString(), 'citation_clicked', {
          citation_key: citation,
          timestamp: Date.now()
        });
        
        // Scroll to citation section if exists
        const citationSection = document.getElementById('citations');
        if (citationSection) {
          citationSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          content: newContent
        }
      });
    }
  };

  const handleStyleUpdate = (styleKey: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        meta: {
          ...block.meta,
          styles: {
            ...block.meta?.styles,
            [styleKey]: value
          }
        }
      });
    }
  };

  const handleDoubleClick = () => {
    if (!readonly) {
      setIsEditing(true);
    }
  };

  const handleEditorBlur = () => {
    setIsEditing(false);
  };

  const customStyles = block.meta?.styles || {};

  if (!readonly && isEditing) {
    return (
      <div 
        className="paragraph-block mb-6 border rounded-lg group"
        style={{
          borderColor: 'var(--editor-focus-border)',
          backgroundColor: 'var(--editor-card-bg)'
        }}
        data-block-id={block.id}
      >
        {/* Style Controls */}
        <div className="flex items-center gap-2 p-2 border-b" style={{ borderColor: 'var(--editor-primary-border)' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStyleControls(!showStyleControls)}
            className="flex items-center gap-1"
          >
            <Palette className="w-4 h-4" />
            Styling
          </Button>
          
          {showStyleControls && (
            <>
              <ColorPicker
                label=""
                value={customStyles.color || '#000000'}
                onChange={(value) => handleStyleUpdate('color', value)}
                showLabel={false}
                compact
              />
              
              <Select 
                value={customStyles.fontSize || 'base'} 
                onValueChange={(value) => handleStyleUpdate('fontSize', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Regular</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={customStyles.textAlign || 'left'} 
                onValueChange={(value) => handleStyleUpdate('textAlign', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <RichTextEditor
          value={payload.content}
          onChange={handleContentChange}
          onBlur={handleEditorBlur}
          autoFocus
          placeholder="Digite o conteúdo do parágrafo..."
          className="min-h-[120px]"
        />
      </div>
    );
  }

  const paragraphStyle = {
    color: customStyles.color || 'var(--editor-primary-text)',
    fontSize: customStyles.fontSize ? {
      'sm': '14px',
      'base': '16px', 
      'lg': '18px',
      'xl': '20px'
    }[customStyles.fontSize] : '16px',
    textAlign: customStyles.textAlign as any || 'left',
    lineHeight: customStyles.lineHeight || '1.6'
  };

  return (
    <div
      className={cn(
        "paragraph-block prose prose-gray max-w-none mb-6 cursor-text group relative",
        "prose-p:leading-relaxed",
        "prose-strong:font-semibold",
        "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        !readonly && "hover:bg-[var(--editor-hover-bg)] rounded-lg p-2 transition-colors"
      )}
      onClick={handleCitationClick}
      onDoubleClick={handleDoubleClick}
      data-block-id={block.id}
    >
      {/* Edit button for non-readonly mode */}
      {!readonly && onUpdate && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
          aria-label="Edit paragraph"
          title="Double-click or click to edit"
        >
          <Edit3 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}

      <div
        style={paragraphStyle}
        dangerouslySetInnerHTML={{
          __html: processContent(payload.content)
        }}
      />
      
      {/* Citation indicators */}
      {payload.citations && payload.citations.length > 0 && (
        <div className="mt-2 text-xs" style={{ color: 'var(--editor-muted-text)' }}>
          <span>Referências: {payload.citations.length}</span>
        </div>
      )}
      
      {/* Edit hint for non-readonly mode */}
      {!readonly && !payload.content && (
        <div 
          className="text-sm italic p-4 border-2 border-dashed rounded-lg text-center"
          style={{
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-muted-text)'
          }}
        >
          Clique duas vezes para editar este parágrafo
        </div>
      )}
    </div>
  );
};
