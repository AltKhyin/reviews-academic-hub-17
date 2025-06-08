
// ABOUTME: Upcoming releases section for home page (shares settings with sidebar)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Bell } from 'lucide-react';
import { useUpcomingReleaseSettings } from '@/hooks/useUpcomingReleaseSettings';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const UpcomingReleasesHomeSection: React.FC = () => {
  const { getNextReleaseDate, settings, isLoading } = useUpcomingReleaseSettings();
  
  const nextReleaseDate = getNextReleaseDate();
  
  const getTimeRemaining = () => {
    if (!nextReleaseDate) return null;
    
    const now = new Date();
    const totalTime = nextReleaseDate.getTime() - now.getTime();
    
    if (totalTime <= 0) return null;
    
    const days = differenceInDays(nextReleaseDate, now);
    const hours = differenceInHours(nextReleaseDate, now) % 24;
    const minutes = differenceInMinutes(nextReleaseDate, now) % 60;
    
    return { days, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Próximas Edições</h2>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Próximas Edições</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nextReleaseDate && timeRemaining ? (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Próxima Edição Programada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {nextReleaseDate.toLocaleString('pt-BR', { 
                    timeZone: 'America/Sao_Paulo',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{timeRemaining.days}</div>
                    <div className="text-xs text-gray-600">dias</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{timeRemaining.hours}</div>
                    <div className="text-xs text-gray-600">horas</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{timeRemaining.minutes}</div>
                    <div className="text-xs text-gray-600">min</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Nova edição com análises e descobertas científicas atualizadas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Edição em Breve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A próxima edição está sendo preparada. Fique atento para novos conteúdos e análises.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Como Participar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Envie suas sugestões de artigos e temas para as próximas edições.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Sugestões Abertas</Badge>
                <Badge variant="outline">Feedback Welcome</Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                Sua participação ajuda a moldar o conteúdo mais relevante para a comunidade científica.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
