
// ABOUTME: Upcoming releases section - 100% copy from dashboard version
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Bell } from 'lucide-react';
import { useUpcomingReleaseSettings } from '@/hooks/useUpcomingReleaseSettings';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const UpcomingReleasesSection: React.FC = () => {
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
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Próximas Edições</h2>
        <Card className="animate-pulse border-border bg-card">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted/60 rounded w-full mb-2"></div>
            <div className="h-4 bg-muted/60 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Próximas Edições</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nextReleaseDate && timeRemaining ? (
          <Card className="border-l-4 border-l-accent bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                <Clock className="w-5 h-5 text-foreground" />
                Próxima Edição Programada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
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
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground">{timeRemaining.days}</div>
                    <div className="text-xs text-muted-foreground">dias</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground">{timeRemaining.hours}</div>
                    <div className="text-xs text-muted-foreground">horas</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground">{timeRemaining.minutes}</div>
                    <div className="text-xs text-muted-foreground">min</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Nova edição com análises e descobertas científicas atualizadas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Nova Edição em Breve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A próxima edição está sendo preparada. Fique atento para novos conteúdos e análises.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-gradient-to-br from-secondary to-accent bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Bell className="w-5 h-5 text-foreground" />
              Como Participar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Envie suas sugestões de artigos e temas para as próximas edições.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-border text-muted-foreground">Sugestões Abertas</Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">Feedback Welcome</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Sua participação ajuda a moldar o conteúdo mais relevante para a comunidade científica.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
