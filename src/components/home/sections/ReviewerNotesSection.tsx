
// ABOUTME: Section displaying reviewer/admin notes on the home page
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
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Notas dos Revisores</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Notas dos Revisores</h2>
        <Badge variant="secondary">{reviewerNotes.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {reviewerNotes.map((note) => (
          <Card key={note.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={note.avatar_url || undefined} alt={note.display_name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {note.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {note.display_name}
                    </span>
                    {note.is_verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      Revisor
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                    {note.message}
                  </p>
                  
                  <div className="text-xs text-gray-500">
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
