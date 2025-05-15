
import React from 'react';
import { BookOpen, MessageSquare, Heart, Bookmark } from 'lucide-react';

interface ActivityIconProps {
  type: string;
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ type }) => {
  switch (type) {
    case 'read':
      return <BookOpen className="h-4 w-4" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'like':
      return <Heart className="h-4 w-4" />;
    case 'save':
      return <Bookmark className="h-4 w-4" />;
    case 'post':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

export const getActivityColor = (type: string) => {
  switch (type) {
    case 'read':
      return 'bg-status-green';
    case 'comment':
      return 'bg-status-amber';
    case 'like':
      return 'bg-status-red';
    case 'save':
      return 'bg-status-purple';
    case 'post':
      return 'bg-status-blue';
    default:
      return 'bg-status-green';
  }
};
