
// ABOUTME: Reviewer quote block for expert commentary and testimonials
// Displays attributed quotes with author information and avatars

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewBlock } from '@/types/review';
import { Quote, User } from 'lucide-react';

interface ReviewerQuoteProps {
  block: ReviewBlock;
  readonly?: boolean;
}

export const ReviewerQuote: React.FC<ReviewerQuoteProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const quote = payload.quote || '';
  const author = payload.author || '';
  const title = payload.title || '';
  const institution = payload.institution || '';
  const avatarUrl = payload.avatar_url || '';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
                <p 
                  className="text-lg italic leading-relaxed"
                  style={{ color: '#ffffff' }}
                >
                  "{quote}"
                </p>
              </blockquote>

              {/* Author Information */}
              <div className="flex items-center gap-3 pt-4 border-t" 
                   style={{ borderColor: '#2a2a2a' }}>
                
                {/* Avatar */}
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

                {/* Author Details */}
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
};
