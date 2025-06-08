
// ABOUTME: Section displaying reviewer/admin notes on the home page - Monochromatic design compliant
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ReviewerNotesSection: React.FC = () => {
  const { reviewerNotes, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-6 h-6 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Notas dos Revisores</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted/60 rounded w-full"></div>
                    <div className="h-4 bg-muted/60 rounded w-3/4"></div>
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Notas dos Revisores</h2>
        <Badge variant="secondary">{reviewerNotes.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {reviewerNotes.map((note) => (
          <Card key={note.id} className="border-l-4 border-l-accent bg-card hover:shadow-md transition-shadow">
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
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      Revisor
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    {note.message}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
