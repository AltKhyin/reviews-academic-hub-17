
// ABOUTME: Rich text paragraph block with citation support
// Renders formatted content with inline citations and proper typography

import React, { useEffect, useState } from 'react';
import { ReviewBlock, ParagraphPayload } from '@/types/review';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
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

  const handleDoubleClick = () => {
    if (!readonly) {
      setIsEditing(true);
    }
  };

  const handleEditorBlur = () => {
    setIsEditing(false);
  };

  if (!readonly && isEditing) {
    return (
      <div 
        className="paragraph-block mb-6 border rounded-lg"
        style={{
          borderColor: 'var(--editor-focus-border)',
          backgroundColor: 'var(--editor-card-bg)'
        }}
        data-block-id={block.id}
      >
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

  return (
    <div
      className={cn(
        "paragraph-block prose prose-gray max-w-none mb-6 cursor-text",
        "prose-p:text-gray-800 prose-p:leading-relaxed prose-p:text-base",
        "prose-strong:text-gray-900 prose-strong:font-semibold",
        "prose-em:text-gray-700",
        "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        !readonly && "hover:bg-[var(--editor-hover-bg)] rounded-lg p-2 transition-colors"
      )}
      style={{
        color: 'var(--editor-primary-text)'
      }}
      onClick={handleCitationClick}
      onDoubleClick={handleDoubleClick}
      data-block-id={block.id}
    >
      <div
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
