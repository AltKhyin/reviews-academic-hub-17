
// ABOUTME: Reviewer quote block with inline editing for expert commentary
// Direct editing of quotes, author info, and institution details

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
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

  if (readonly) {
    return (
      <div className="reviewer-quote-block my-8">
        <Card 
          className="border-l-4 shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            borderLeftColor: '#a855f7'
          }}
        >
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                >
                  <Quote 
                    className="w-4 h-4" 
                    style={{ color: '#a855f7' }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <blockquote>
                  <p 
                    className="text-lg italic leading-relaxed"
                    style={{ color: '#ffffff' }}
                  >
                    "{quote}"
                  </p>
                </blockquote>

                <div className="flex items-center gap-3 pt-4 border-t" 
                     style={{ borderColor: '#2a2a2a' }}>
                  
                  <Avatar className="w-10 h-10">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={author} />
                    ) : (
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: '#a855f7',
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
                      style={{ color: '#ffffff' }}
                    >
                      {author}
                    </div>
                    
                    {title && (
                      <div 
                        className="text-sm"
                        style={{ color: '#d1d5db' }}
                      >
                        {title}
                      </div>
                    )}
                    
                    {institution && (
                      <div 
                        className="text-sm"
                        style={{ color: '#9ca3af' }}
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
    <div className="reviewer-quote-block my-8">
      <Card 
        className="border-l-4 shadow-lg"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a',
          borderLeftColor: '#a855f7'
        }}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Quote Icon */}
            <div className="flex-shrink-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
              >
                <Quote 
                  className="w-4 h-4" 
                  style={{ color: '#a855f7' }}
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
                />
              </blockquote>

              {/* Author Information */}
              <div className="flex items-start gap-3 pt-4 border-t" 
                   style={{ borderColor: '#2a2a2a' }}>
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-10 h-10">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={author} />
                    ) : (
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: '#a855f7',
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
                  />
                  
                  <InlineTextEditor
                    value={title}
                    onChange={(value) => handleUpdate('title', value)}
                    placeholder="Título/Cargo (opcional)"
                    className="text-sm"
                  />
                  
                  <InlineTextEditor
                    value={institution}
                    onChange={(value) => handleUpdate('institution', value)}
                    placeholder="Instituição (opcional)"
                    className="text-sm"
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
                      borderColor: '#2a2a2a',
                      color: '#ffffff'
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
