
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentContentProps {
  content: string;
  className?: string;
  created_at?: string;
  profileName?: string;
  avatarUrl?: string;
}

interface CommentHeaderProps {
  profileName: string;
  avatarUrl?: string;
  created_at: string;
}

export const CommentHeader: React.FC<CommentHeaderProps> = ({ 
  profileName, 
  avatarUrl, 
  created_at 
}) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          {profileName?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-300">{profileName}</span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </span>
      </div>
    </div>
  );
};

export const CommentContent: React.FC<CommentContentProps> = ({ 
  content, 
  className = '',
  created_at,
  profileName,
  avatarUrl
}) => {
  // Check if content contains HTML tags (rich text)
  const isRichText = /<[^>]*>/g.test(content);
  
  return (
    <div>
      {/* Show header if profile info is provided */}
      {profileName && created_at && (
        <CommentHeader 
          profileName={profileName}
          avatarUrl={avatarUrl}
          created_at={created_at}
        />
      )}
      
      {isRichText ? (
        <div 
          className={`prose prose-sm max-w-none text-gray-200 ${className}`}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            // Override prose styles for dark theme
            color: '#e5e7eb'
          }}
        />
      ) : (
        <div className={`whitespace-pre-wrap text-gray-200 ${className}`}>
          {content}
        </div>
      )}
    </div>
  );
};
