
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const UpcomingReleaseSection = () => {
  const { user } = useAuth();
  const { data: release, isLoading: releaseLoading } = useUpcomingRelease();
  const { suggestions, addSuggestion, voteSuggestion } = useContentSuggestions(release?.id || '');
  const [newSuggestion, setNewSuggestion] = useState('');

  const getTimeRemaining = () => {
    if (!release) return null;
    const now = new Date();
    const releaseDate = new Date(release.release_date);
    const totalTime = releaseDate.getTime() - now.getTime();
    const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const progressPercentage = Math.max(0, Math.min(100, (1 - totalTime / totalDuration) * 100));
    
    const days = differenceInDays(releaseDate, now);
    const hours = differenceInHours(releaseDate, now) % 24;
    const minutes = differenceInMinutes(releaseDate, now) % 60;
    
    return { 
      days, 
      hours, 
      minutes, 
      progressPercentage,
      timeUnit: days > 0 ? 'Dias' : (hours > 0 ? 'Horas' : 'Minutos')
    };
  };

  const timeRemaining = getTimeRemaining();

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    
    addSuggestion.mutate({
      title: newSuggestion.trim()
    }, {
      onSuccess: () => setNewSuggestion('')
    });
  };

  if (releaseLoading || !release) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-serif mb-6">Próxima Edição</h2>
      
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <Progress 
            value={timeRemaining?.progressPercentage} 
            className="w-full h-3" 
          />
          <div className="flex justify-between items-center">
            <span className="text-4xl font-bold">
              {timeRemaining?.[timeRemaining?.timeUnit.toLowerCase() as keyof typeof timeRemaining]}
            </span>
            <span className="text-sm text-muted-foreground">
              {timeRemaining?.timeUnit}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-medium">Sugestões de Conteúdo</h3>
          
          {user && (
            <form onSubmit={handleSubmitSuggestion} className="flex gap-2">
              <Input
                placeholder="Sugira um tema para a próxima edição..."
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
              />
              <Button type="submit" disabled={addSuggestion.isPending}>
                Sugerir
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarFallback>
                      {suggestion.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <span className="font-medium">{suggestion.title}</span>
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {suggestion.votes} votos
                  </span>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteSuggestion.mutate(suggestion.id)}
                      disabled={voteSuggestion.isPending}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};
