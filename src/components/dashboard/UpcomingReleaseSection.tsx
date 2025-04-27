
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const UpcomingReleaseSection = () => {
  const { user } = useAuth();
  const { data: release, isLoading: releaseLoading } = useUpcomingRelease();
  const { suggestions, addSuggestion, voteSuggestion } = useContentSuggestions(release?.id || '');
  const [newSuggestion, setNewSuggestion] = useState('');

  const getTimeRemaining = () => {
    if (!release) return null;
    const now = new Date();
    const releaseDate = new Date(release.release_date);
    
    const days = differenceInDays(releaseDate, now);
    const hours = differenceInHours(releaseDate, now) % 24;
    const minutes = differenceInMinutes(releaseDate, now) % 60;
    
    return { days, hours, minutes };
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
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-secondary/10 rounded-lg p-4">
            <span className="text-3xl font-bold">{timeRemaining?.days}</span>
            <p className="text-sm text-muted-foreground">Dias</p>
          </div>
          <div className="bg-secondary/10 rounded-lg p-4">
            <span className="text-3xl font-bold">{timeRemaining?.hours}</span>
            <p className="text-sm text-muted-foreground">Horas</p>
          </div>
          <div className="bg-secondary/10 rounded-lg p-4">
            <span className="text-3xl font-bold">{timeRemaining?.minutes}</span>
            <p className="text-sm text-muted-foreground">Minutos</p>
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

          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/5">
                <span>{suggestion.title}</span>
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
