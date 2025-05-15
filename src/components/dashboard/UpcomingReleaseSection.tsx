import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Calendar } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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

  // Format relative time for suggestions
  const formatRelativeTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: ptBR
    });
  };

  if (releaseLoading) return null;

  return (
    <section className="mb-12">
      <Card className="overflow-hidden bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column - Countdown and suggestion form */}
          <div className="p-6 flex flex-col justify-center border-r border-border md:border-r-0 md:border-b-0">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Próxima Edição</h3>
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">
                    {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                    {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
                    {timeRemaining.minutes}min
                  </span>
                </div>
              </div>
              
              {/* Progress bar showing the week's progress */}
              <Progress 
                value={timeRemaining.progressPercentage} 
                className="h-2 mt-2"
                indicatorClassName="bg-primary"
              />
            </div>
            
            <div className="space-y-4 flex flex-col justify-center">              
              {/* Suggestion input */}
              {user ? (
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  <Input
                    placeholder="Sugira um artigo ou tema para a próxima edição"
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    type="submit" 
                    disabled={addSuggestion.isPending}
                    className="w-full"
                  >
                    Enviar Sugestão
                  </Button>
                </form>
              ) : (
                <div className="text-center text-muted-foreground text-sm p-4 bg-secondary/10 rounded-md">
                  Faça login para sugerir e votar em temas
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Suggestions with voting - Removed the header text */}
          <div className="bg-secondary/50 dark:bg-secondary/20 flex flex-col">
            {/* Removed the text heading here */}
            
            {/* Scrollable suggestions list with improved styling - expanded height */}
            <div className="flex-1 relative">
              <ScrollArea className="h-[390px] px-6 pb-6 pt-6">
                <div className="space-y-3 pb-8">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-accent/5 transition-colors"
                    >
                      {/* Voting buttons and count */}
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 w-8 rounded-full p-0 ${
                            suggestion.hasVoted 
                              ? "text-[#F97316] border-[#F97316] hover:text-[#F97316] hover:border-[#F97316]/90" 
                              : ""
                          }`}
                          onClick={() => voteSuggestion.mutate({ suggestionId: suggestion.id, value: 1 })}
                          disabled={voteSuggestion.isPending || !user}
                          title="Votar nesta sugestão"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium my-1">
                          {suggestion.votes}
                        </span>
                      </div>
                      
                      {/* User info and suggestion content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="font-medium line-clamp-2">{suggestion.title}</span>
                        </div>
                        
                        {suggestion.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {suggestion.description}
                          </p>
                        )}
                        
                        {/* Author info with timeframe */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
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
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(suggestion.created_at)}
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
              </ScrollArea>
              {/* Fade effect at bottom of scroll area */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-secondary/50 dark:from-secondary/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
