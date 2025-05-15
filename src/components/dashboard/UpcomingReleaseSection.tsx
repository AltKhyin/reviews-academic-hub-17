
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, addDays } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export const UpcomingReleaseSection = () => {
  const { user, profile } = useAuth();
  const { data: release, isLoading: releaseLoading } = useUpcomingRelease();
  const { suggestions, addSuggestion, voteSuggestion } = useContentSuggestions(release?.id || '');
  const [newSuggestion, setNewSuggestion] = useState('');

  // Get the next Saturday at 9am BRT
  const getNextSaturday = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = day === 6 ? 7 : 6 - day;
    let nextSaturday = addDays(now, daysUntilSaturday);
    nextSaturday.setHours(9, 0, 0, 0);
    
    // If it's Saturday after 9am, get next week's Saturday
    if (day === 6 && now.getHours() >= 9) {
      nextSaturday = addDays(nextSaturday, 7);
    }
    
    return nextSaturday;
  };

  const nextSaturday = getNextSaturday();
  
  // Calculate time remaining until next Saturday
  const getTimeRemaining = () => {
    const now = new Date();
    const totalTime = nextSaturday.getTime() - now.getTime();
    const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const progressPercentage = Math.max(0, Math.min(100, (1 - totalTime / totalDuration) * 100));
    
    const days = differenceInDays(nextSaturday, now);
    const hours = differenceInHours(nextSaturday, now) % 24;
    const minutes = differenceInMinutes(nextSaturday, now) % 60;
    
    return { 
      days, 
      hours, 
      minutes, 
      progressPercentage
    };
  };

  const timeRemaining = getTimeRemaining();

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    
    addSuggestion.mutate({
      title: newSuggestion.trim()
    }, {
      onSuccess: () => {
        setNewSuggestion('');
        toast({
          title: "Sugestão enviada!",
          description: "Obrigado pela sua contribuição.",
        });
      }
    });
  };

  // Check if suggestion is less than 24 hours old
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
  };

  if (releaseLoading) return null;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Próxima Edição</h2>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Countdown and suggestion form */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Próxima Edição</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium">
                  {timeRemaining.days > 0 && `${timeRemaining.days} dias `}
                  {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
                  {timeRemaining.minutes > 0 && `${timeRemaining.minutes}min`}
                </span>
              </div>
            </div>
            
            {/* Progress bar showing the week's progress */}
            <Progress 
              value={timeRemaining.progressPercentage} 
              className="w-full h-2" 
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sugestões de Conteúdo</h3>
              
              {/* Suggestion input */}
              {user ? (
                <form onSubmit={handleSubmitSuggestion} className="flex gap-2">
                  <Input
                    placeholder="Sugira um artigo ou tema..."
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={addSuggestion.isPending}
                    className="whitespace-nowrap"
                  >
                    📨 Sugerir
                  </Button>
                </form>
              ) : (
                <div className="text-center text-muted-foreground text-sm p-2 bg-secondary/10 rounded-md">
                  Faça login para sugerir e votar em temas
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Suggestions with voting */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-medium">Votação</h3>
            
            {/* Suggestions list */}
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
                >
                  {/* Voting buttons and count */}
                  <div className="flex flex-col items-center space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => voteSuggestion.mutate({ suggestionId: suggestion.id, value: 1 })}
                      disabled={voteSuggestion.isPending || !user}
                      title="Votar positivamente nesta sugestão"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {suggestion.votes}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => voteSuggestion.mutate({ suggestionId: suggestion.id, value: -1 })}
                      disabled={voteSuggestion.isPending || !user}
                      title="Votar negativamente nesta sugestão"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* User info and suggestion content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium line-clamp-2">{suggestion.title}</span>
                        {isNew(suggestion.created_at) && (
                          <Badge variant="secondary" size="sm" className="ml-2 shrink-0">
                            Novo
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {suggestion.description}
                      </p>
                    )}
                    
                    {/* Author info */}
                    <div className="flex items-center mt-2 gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {suggestion.user?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                        {suggestion.user?.avatar_url && (
                          <AvatarImage src={suggestion.user.avatar_url} />
                        )}
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.user?.full_name || 'Usuário'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  Ainda não há sugestões. Seja o primeiro a sugerir!
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
