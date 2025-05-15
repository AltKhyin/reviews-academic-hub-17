
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivities } from './activity/useActivities';
import { ActivityList } from './activity/ActivityList';

interface ProfileActivityProps {
  userId?: string;
  className?: string;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId, className = '' }) => {
  const { activities, loading } = useActivities(userId);

  return (
    <Card className={`bg-[#1a1a1a] rounded-lg shadow-lg card-elevation ${className}`}>
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">Atividade Recente</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ActivityList activities={activities} loading={loading} />
      </CardContent>
    </Card>
  );
};
