
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedItemProps {
  id: string;
  title: string;
  description?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  url: string;
}

export const SavedItemCard: React.FC<SavedItemProps> = ({ 
  id, 
  title, 
  description, 
  author, 
  date, 
  url 
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Card key={id} className="bg-[#212121] hover:bg-[#2a2a2a] transition-colors border-0">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {author?.avatar && (
            <Avatar className="w-10 h-10 mt-1">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-1 text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{description}</p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{author?.name}</span>
              <span>{formatDate(date)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs border-gray-700"
            asChild
          >
            <a href={url}>Visualizar</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
