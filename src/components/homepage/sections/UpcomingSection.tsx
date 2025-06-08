
// ABOUTME: Enhanced upcoming releases section with real data and countdown
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { useUpcomingReleaseSettings } from '@/hooks/useUpcomingReleaseSettings';
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UpcomingSection: React.FC = () => {
  const { getNextReleaseDate, isLoading } = useUpcomingReleaseSettings();
  
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
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Próximas Edições
        </h2>
        <div className="animate-pulse">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Próximas Edições
      </h2>
      <div className="space-y-4">
        {nextReleaseDate && timeRemaining ? (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Próxima Edição
              </CardTitle>
              <p className="text-sm text-gray-500">
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
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg text-blue-600">{timeRemaining.days}</span>
                  <span className="text-gray-600">dias</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg text-blue-600">{timeRemaining.hours}</span>
                  <span className="text-gray-600">horas</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg text-blue-600">{timeRemaining.minutes}</span>
                  <span className="text-gray-600">minutos</span>
                </div>
              </div>
              <p className="text-gray-600 mt-3">
                Nova edição com análises e descobertas científicas atualizadas.
              </p>
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Participar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Envie suas sugestões de artigos e temas para as próximas edições através da seção de sugestões.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
