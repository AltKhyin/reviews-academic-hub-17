
// ABOUTME: Simplified reviewer notes section - Twitter-like format, monochromatic design compliant
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ReviewerNotesSection: React.FC = () => {
  const { reviewerNotes, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Notas do Revisor</h2>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted/60 rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reviewerNotes || reviewerNotes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Notas do Revisor</h2>
      
      <div className="space-y-3">
        {reviewerNotes.slice(0, 3).map((note) => (
          <Card key={note.id} className="border-border bg-card hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={note.avatar_url || undefined} alt={note.display_name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {note.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-card-foreground">
                      {note.display_name}
                    </span>
                    {note.is_verified && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {note.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
