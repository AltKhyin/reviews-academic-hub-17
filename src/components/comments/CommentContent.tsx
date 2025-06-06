
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentContentProps {
  content: string;
  created_at: string;
  profileName: string;
  avatarUrl?: string | null;
}

export const CommentContent: React.FC<CommentContentProps> = ({
  content,
  created_at,
  profileName,
  avatarUrl
}) => {
  const avatarFallback = profileName?.[0] || 'U';
  
  // Render formatted content as HTML
  const renderFormattedContent = (text: string) => {
    // Clean and sanitize the HTML content to only allow basic formatting
    const cleanedContent = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ''); // Remove styles
    
    return { __html: cleanedContent };
  };
  
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">
          {profileName}
        </span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </span>
      </div>
      
      <div 
        className="text-sm mb-2 prose-sm prose-invert max-w-none"
        dangerouslySetInnerHTML={renderFormattedContent(content)}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    </div>
  );
};

export const CommentHeader: React.FC<Omit<CommentContentProps, 'content'>> = ({
  profileName,
  avatarUrl,
  created_at
}) => {
  const avatarFallback = profileName?.[0] || 'U';
  
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-6 h-6 mt-1">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    </div>
  );
};
