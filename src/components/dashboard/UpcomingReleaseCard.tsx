
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Calendar, ArrowUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export const UpcomingReleaseCard = () => {
  const { user } = useAuth();
  const { data: upcomingRelease } = useUpcomingRelease();
  const { suggestions, addSuggestion, voteSuggestion } = useContentSuggestions(upcomingRelease?.id || 'default');
  const [suggestion, setSuggestion] = useState('');

  // Get the next Saturday at 9am BRT
  const getNextSaturday = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSaturday = day === 6 ? 7 : 6 - day;
    let nextSaturday = addDays(now, daysUntilSaturday);
    nextSaturday.setHours(9, 0, 0, 0);
    
    if (day === 6 && now.getHours() >= 9) {
      nextSaturday = addDays(nextSaturday, 7);
    }
    
    return nextSaturday;
  };

  const nextSaturday = getNextSaturday();
  
  const getTimeRemaining = () => {
    const now = new Date();
    const totalTime = nextSaturday.getTime() - now.getTime();
    const totalDuration = 7 * 24 * 60 * 60 * 1000;
    const progressPercentage = Math.max(0, Math.min(100, (1 - totalTime / totalDuration) * 100));
    
    const days = differenceInDays(nextSaturday, now);
    const hours = differenceInHours(nextSaturday, now) % 24;
    const minutes = differenceInMinutes(nextSaturday, now) % 60;
    
    return { days, hours, minutes, progressPercentage };
  };

  const timeRemaining = getTimeRemaining();

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para enviar sugestões.",
        variant: "destructive",
      });
      return;
    }
    
    addSuggestion.mutate({
      title: suggestion.trim()
    }, {
      onSuccess: () => {
        setSuggestion('');
        toast({
          title: "Sugestão enviada!",
          description: "Obrigado pela sua contribuição.",
        });
      }
    });
  };

  const handleVote = (suggestionId: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em sugestões.",
        variant: "destructive",
      });
      return;
    }
    
    voteSuggestion.mutate({ suggestionId, value: 1 });
  };

  const formatRelativeTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <section className="mb-12">
      <Card className="border text-card-foreground shadow-sm overflow-hidden bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Release info and suggestion form */}
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
              <Progress value={timeRemaining.progressPercentage} className="h-2 mt-2" />
            </div>
            
            <div className="space-y-4 flex flex-col justify-center">
              {user ? (
                <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                  <Input
                    placeholder="Sugira um artigo ou tema para a próxima edição"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    className="w-full" 
                    type="submit"
                    disabled={addSuggestion.isPending || !suggestion.trim()}
                  >
                    {addSuggestion.isPending ? 'Enviando...' : 'Enviar Sugestão'}
                  </Button>
                </form>
              ) : (
                <div className="text-center text-muted-foreground text-sm p-4 bg-secondary/10 rounded-md">
                  Faça login para sugerir e votar em temas
                </div>
              )}
            </div>
          </div>

          {/* Right side - Suggestions list */}
          <div className="bg-secondary/50 dark:bg-secondary/20 flex flex-col">
            <div className="flex-1 relative">
              <ScrollArea className="h-[390px] px-6 pb-6 pt-6">
                <div className="space-y-3 pb-8">
                  {suggestions.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 rounded-full p-0 ${
                            item.hasVoted 
                              ? "text-[#F97316] border-[#F97316] hover:text-[#F97316] hover:border-[#F97316]/90" 
                              : ""
                          }`}
                          onClick={() => handleVote(item.id)}
                          disabled={voteSuggestion.isPending || !user}
                          title="Votar nesta sugestão"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium my-1">{item.votes}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="font-medium line-clamp-2">{item.title}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={item.user?.avatar_url} />
                              <AvatarFallback>{item.user?.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {item.user?.full_name || 'Usuário'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(item.created_at)}
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
              
              {/* Gradient fade at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-secondary/50 dark:from-secondary/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default UpcomingReleaseCard;
