
// ABOUTME: Editor component for image blocks.
// Allows setting image source URL, alt text, and caption.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ImageBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { src?: string; alt?: string; caption?: string };
  onUpdateContent: (newContent: { src?: string; alt?: string; caption?: string }) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { src = '', alt = '', caption = '' } = content || {};

  const handleChange = (field: keyof ImageBlockProps['content'], value: string) => {
    onUpdateContent({ ...content, [field]: value });
  };

  if (readonly) {
    return (
      <figure className="my-2">
        {src ? <img src={src} alt={alt} className="max-w-full h-auto rounded-md mx-auto border border-gray-700" /> : <div className="text-center text-gray-500 text-sm p-4 border border-dashed border-gray-600 rounded-md">Imagem não fornecida</div>}
        {caption && <figcaption className="text-center text-sm text-gray-500 mt-1 italic">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="p-2 space-y-3 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`image-src-${block.id}`} className="text-xs text-gray-400">URL da Imagem</Label>
        <Input 
          id={`image-src-${block.id}`} 
          value={src} 
          onChange={(e) => handleChange('src', e.target.value)} 
          placeholder="https://example.com/image.png"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
      {src && (
        <div className="my-2 text-center">
          <img src={src} alt={alt || "Pré-visualização da imagem"} className="max-w-xs h-auto rounded mx-auto border border-gray-600" />
        </div>
      )}
      <div>
        <Label htmlFor={`image-alt-${block.id}`} className="text-xs text-gray-400">Texto Alternativo (Alt)</Label>
        <Input 
          id={`image-alt-${block.id}`} 
          value={alt} 
          onChange={(e) => handleChange('alt', e.target.value)} 
          placeholder="Descrição concisa da imagem"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
      <div>
        <Label htmlFor={`image-caption-${block.id}`} className="text-xs text-gray-400">Legenda (Caption)</Label>
        <Input 
          id={`image-caption-${block.id}`} 
          value={caption} 
          onChange={(e) => handleChange('caption', e.target.value)} 
          placeholder="Legenda opcional para a imagem"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
    </div>
  );
};

