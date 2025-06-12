
// ABOUTME: Upcoming releases section component for homepage
// Displays upcoming medical content releases using real data
import React from 'react';
import { useUpcomingReleaseSettings } from '@/hooks/useUpcomingReleaseSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

export const UpcomingSection: React.FC = () => {
  const { getNextReleaseDate, isLoading } = useUpcomingReleaseSettings();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const nextReleaseDate = getNextReleaseDate();

  if (!nextReleaseDate) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Próximas Edições</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhuma edição programada no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDaysUntilRelease = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilRelease(nextReleaseDate);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Próximas Edições</h2>
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próxima Edição
            </CardTitle>
            {daysUntil > 0 && (
              <Badge variant="secondary">
                {daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(nextReleaseDate)}</span>
            </div>
            
            {daysUntil <= 7 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium">
                  {daysUntil === 0 ? 'Lançamento hoje!' : 
                   daysUntil === 1 ? 'Lançamento amanhã!' : 
                   `Faltam apenas ${daysUntil} dias!`}
                </p>
                <p className="text-orange-600 text-sm mt-1">
                  Acompanhe as novidades da medicina baseada em evidências.
                </p>
              </div>
            )}
            
            {daysUntil > 7 && (
              <p className="text-gray-600">
                Aguarde por mais conteúdo científico de qualidade.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
