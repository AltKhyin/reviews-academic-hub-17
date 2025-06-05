
// ABOUTME: Reviewer quote block with inline editing for expert commentary
// Direct editing of quotes, author info, and institution details

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Input } from '@/components/ui/input';
import { Quote, User, Upload } from 'lucide-react';

interface ReviewerQuoteProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const ReviewerQuote: React.FC<ReviewerQuoteProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload;
  const quote = payload.quote || '';
  const author = payload.author || '';
  const title = payload.title || '';
  const institution = payload.institution || '';
  const avatarUrl = payload.avatar_url || '';

  // Color system integration
  const textColor = payload.text_color || '#ffffff';
  const backgroundColor = payload.background_color || '#1a1a1a';
  const borderColor = payload.border_color || '#2a2a2a';
  const accentColor = payload.accent_color || '#a855f7';

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderLeftColor: accentColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="reviewer-quote-block my-8">
        <Card 
          className="border-l-4 shadow-lg"
          style={cardStyle}
        >
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}1a` }}
                >
                  <Quote 
                    className="w-4 h-4" 
                    style={{ color: accentColor }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <blockquote>
                  <p 
                    className="text-lg italic leading-relaxed"
                    style={{ color: textColor }}
                  >
                    "{quote}"
                  </p>
                </blockquote>

                <div className="flex items-center gap-3 pt-4 border-t" 
                     style={{ borderColor: borderColor }}>
                  
                  <Avatar className="w-10 h-10">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={author} />
                    ) : (
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: accentColor,
                          color: '#ffffff'
                        }}
                      >
                        {author ? getInitials(author) : <User className="w-5 h-5" />}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div 
                      className="font-semibold"
                      style={{ color: textColor }}
                    >
                      {author}
                    </div>
                    
                    {title && (
                      <div 
                        className="text-sm"
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        {title}
                      </div>
                    )}
                    
                    {institution && (
                      <div 
                        className="text-sm"
                        style={{ color: textColor, opacity: 0.6 }}
                      >
                        {institution}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="reviewer-quote-block my-8 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card 
        className="border-l-4 shadow-lg"
        style={cardStyle}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Quote Icon */}
            <div className="flex-shrink-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}1a` }}
              >
                <Quote 
                  className="w-4 h-4" 
                  style={{ color: accentColor }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              {/* Quote Text */}
              <blockquote>
                <InlineTextEditor
                  value={quote}
                  onChange={(value) => handleUpdate('quote', value)}
                  placeholder="Digite a citação aqui..."
                  multiline
                  className="text-lg italic leading-relaxed"
                  style={{ color: textColor }}
                />
              </blockquote>

              {/* Author Information */}
              <div className="flex items-start gap-3 pt-4 border-t" 
                   style={{ borderColor: borderColor }}>
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-10 h-10">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={author} />
                    ) : (
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: accentColor,
                          color: '#ffffff'
                        }}
                      >
                        {author ? getInitials(author) : <User className="w-5 h-5" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs p-1 h-auto"
                    onClick={() => {
                      // TODO: Implement avatar upload
                      console.log('Upload avatar');
                    }}
                  >
                    <Upload className="w-3 h-3" />
                  </Button>
                </div>

                {/* Author Details */}
                <div className="flex-1 space-y-2">
                  <InlineTextEditor
                    value={author}
                    onChange={(value) => handleUpdate('author', value)}
                    placeholder="Nome do autor"
                    className="font-semibold"
                    style={{ color: textColor }}
                  />
                  
                  <InlineTextEditor
                    value={title}
                    onChange={(value) => handleUpdate('title', value)}
                    placeholder="Título/Cargo (opcional)"
                    className="text-sm"
                    style={{ color: textColor, opacity: 0.8 }}
                  />
                  
                  <InlineTextEditor
                    value={institution}
                    onChange={(value) => handleUpdate('institution', value)}
                    placeholder="Instituição (opcional)"
                    className="text-sm"
                    style={{ color: textColor, opacity: 0.6 }}
                  />

                  {/* Avatar URL Input */}
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => handleUpdate('avatar_url', e.target.value)}
                    placeholder="URL do avatar (opcional)"
                    className="text-xs mt-2"
                    style={{ 
                      backgroundColor: '#212121',
                      borderColor: borderColor,
                      color: textColor
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
