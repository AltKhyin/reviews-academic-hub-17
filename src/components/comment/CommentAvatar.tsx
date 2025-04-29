
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentAvatarProps {
  avatarUrl: string | null;
  fullName: string | null;
}

export const CommentAvatar: React.FC<CommentAvatarProps> = ({ 
  avatarUrl,
  fullName
}) => {
  const initials = fullName 
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) 
    : '?';

  return (
    <Avatar className="h-8 w-8">
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={fullName || "User"} />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};
