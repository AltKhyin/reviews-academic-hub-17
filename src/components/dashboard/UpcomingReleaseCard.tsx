
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ArrowUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingRelease } from '@/hooks/useUpcomingRelease';

// Mock suggestions data - in real app this would come from API
const mockSuggestions = [
  {
    id: '1',
    title: 'Test 9891',
    votes: 1,
    author: {
      name: 'Igor Cogo Koehler',
      avatar: 'https://kznasfgubbyinomtetiu.supabase.co/storage/v1/object/public/avatars/b0b09a72-c43c-4061-b6f7-7ac8b156b4e7-s1noze3niio.jpg'
    },
    createdAt: 'há 20 dias'
  },
  {
    id: '2',
    title: 'Testing again',
    votes: 0,
    author: {
      name: 'Igor Cogo Koehler',
      avatar: 'https://kznasfgubbyinomtetiu.supabase.co/storage/v1/object/public/avatars/b0b09a72-c43c-4061-b6f7-7ac8b156b4e7-s1noze3niio.jpg'
    },
    createdAt: 'há 20 dias'
  },
  {
    id: '3',
    title: 'teste',
    votes: 0,
    author: {
      name: 'Igor Cogo Koehler',
      avatar: 'https://kznasfgubbyinomtetiu.supabase.co/storage/v1/object/public/avatars/b0b09a72-c43c-4061-b6f7-7ac8b156b4e7-s1noze3niio.jpg'
    },
    createdAt: 'há cerca de 1 mês'
  },
  {
    id: '4',
    title: 'Test 2',
    votes: 0,
    author: {
      name: 'Igor Cogo Koehler',
      avatar: 'https://kznasfgubbyinomtetiu.supabase.co/storage/v1/object/public/avatars/b0b09a72-c43c-4061-b6f7-7ac8b156b4e7-s1noze3niio.jpg'
    },
    createdAt: 'há 20 dias'
  },
  {
    id: '5',
    title: 'Test',
    votes: 0,
    author: {
      name: 'Igor Cogo Koehler',
      avatar: 'https://kznasfgubbyinomtetiu.supabase.co/storage/v1/object/public/avatars/b0b09a72-c43c-4061-b6f7-7ac8b156b4e7-s1noze3niio.jpg'
    },
    createdAt: 'há 20 dias'
  }
];

export const UpcomingReleaseCard = () => {
  const { data: upcomingRelease } = useUpcomingRelease();
  const [suggestion, setSuggestion] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 21, minutes: 4 });
  const [progress, setProgress] = useState(58.9);

  // Calculate time left and progress (simplified for demo)
  useEffect(() => {
    const timer = setInterval(() => {
      // This would be calculated based on actual release date
      // For now using static values from reference
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.trim()) {
      console.log('Suggestion submitted:', suggestion);
      setSuggestion('');
      // In real app, this would submit to API
    }
  };

  const handleVote = (suggestionId: string) => {
    console.log('Vote for suggestion:', suggestionId);
    // In real app, this would submit vote to API
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
                  <span className="font-medium">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}min</span>
                </div>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </div>
            
            <div className="space-y-4 flex flex-col justify-center">
              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <input 
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
                  placeholder="Sugira um artigo ou tema para a próxima edição"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                />
                <Button className="w-full" type="submit">
                  Enviar Sugestão
                </Button>
              </form>
            </div>
          </div>

          {/* Right side - Suggestions list */}
          <div className="bg-secondary/50 dark:bg-secondary/20 flex flex-col">
            <div className="flex-1 relative">
              <ScrollArea className="h-[390px] px-6 pb-6 pt-6">
                <div className="space-y-3 pb-8">
                  {mockSuggestions.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => handleVote(item.id)}
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
                              <AvatarImage src={item.author.avatar} />
                              <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{item.author.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
