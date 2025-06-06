
// ABOUTME: Comment content display with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CSS_VARIABLES } from '@/utils/colorSystem';

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
  
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
          {profileName}
        </span>
        <span className="text-xs" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
          {formatDistanceToNow(new Date(created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </span>
      </div>
      
      <p className="text-sm mb-2" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>{content}</p>
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
