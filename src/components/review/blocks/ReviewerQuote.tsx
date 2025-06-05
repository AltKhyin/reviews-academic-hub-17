
// ABOUTME: Expert commentary and reviewer quotes with attribution
// Displays professional opinions with author credentials

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { ReviewBlock, ReviewerQuotePayload } from '@/types/review';

interface ReviewerQuoteProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const ReviewerQuote: React.FC<ReviewerQuoteProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as ReviewerQuotePayload;

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id, 'viewed', {
              block_type: 'reviewer_quote',
              author: payload.author,
              has_avatar: !!payload.avatar_url,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, payload.author, payload.avatar_url]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="reviewer-quote bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 my-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Quote Icon */}
          <Quote className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            {/* Quote Text */}
            <blockquote className="text-lg text-gray-800 leading-relaxed mb-4 italic">
              "{payload.quote}"
            </blockquote>
            
            {/* Author Attribution */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                {payload.avatar_url && (
                  <AvatarImage 
                    src={payload.avatar_url} 
                    alt={payload.author}
                  />
                )}
                <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                  {getInitials(payload.author)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-semibold text-gray-900">
                  {payload.author}
                </div>
                {payload.title && (
                  <div className="text-sm text-gray-600">
                    {payload.title}
                  </div>
                )}
                {payload.institution && (
                  <div className="text-sm text-gray-500">
                    {payload.institution}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
