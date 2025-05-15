
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ActivityIcon, getActivityColor } from './ActivityIcon';

export interface Activity {
  id: string;
  type: 'read' | 'comment' | 'like' | 'save' | 'post';
  title: string;
  entityId: string;
  date: string;
  description?: string;
  category?: string;
}

interface ActivityItemProps {
  activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-[#212121] rounded-md hover-effect">
      <div className="mt-1 flex-shrink-0">
        <div className={`${getActivityColor(activity.type)} rounded-full p-2 flex items-center justify-center`}>
          <ActivityIcon type={activity.type} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="font-medium">{activity.title}</p>
          {activity.category && (
            <Badge variant="outline" className="text-xs bg-[#2a2a2a] text-white border-0">
              {activity.category}
            </Badge>
          )}
        </div>
        
        {activity.description && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
        </div>
      </div>
    </div>
  );
};
