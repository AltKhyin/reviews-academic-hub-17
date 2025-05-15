
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActivityItem, Activity } from './ActivityItem';

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Exibe apenas 4 atividades, ou todas se expandido
  const displayActivities = expanded ? activities : activities.slice(0, 4);
  
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-pulse text-gray-400">Carregando atividades...</div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p>Nenhuma atividade recente encontrada</p>
      </div>
    );
  }
  
  return (
    <>
      {displayActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
      
      {activities.length > 4 && (
        <div className="pt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-400 hover:text-white"
          >
            {expanded ? 'Mostrar menos' : 'Ver mais atividades'}
          </Button>
        </div>
      )}
    </>
  );
};
