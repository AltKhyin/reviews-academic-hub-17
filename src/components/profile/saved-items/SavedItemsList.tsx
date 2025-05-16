import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedItem {
  id: string;
  title: string;
  description?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  url: string;
  coverImage?: string;
  tags?: string[];
  status?: 'published' | 'draft';
}

interface SavedItemsListProps {
  items: SavedItem[];
  loading: boolean;
  type: 'reviews' | 'posts';
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({ items, loading, type }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-pulse text-gray-400">Carregando itens...</div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p>Nenhum {type === 'reviews' ? 'review favorito' : 'post salvo'} encontrado</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  return (
    <div className="space-y-6">
      {type === 'reviews' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Card key={item.id} className="hover:bg-accent/5 transition-colors border-white/10 bg-white/5">
              <CardContent className="p-0">
                <div className="w-full mb-2">
                  {item.coverImage ? (
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-800" />
                  )}
                </div>
                <div className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {item.status === 'draft' ? 'Rascunho' : 'Publicado'}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="text-xs text-gray-400 mb-2">
                      Tags: {item.tags.map(tag => `[tag:${tag}]`).join(' ')}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={item.url}>Visualizar</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Keep the original list format for posts
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id} className="bg-[#212121] hover:bg-[#2a2a2a] transition-colors border-0">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {item.author?.avatar && (
                    <div className="w-10 h-10 mt-1 rounded-full overflow-hidden flex-shrink-0">
                      <img src={item.author.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{item.author?.name}</span>
                      <span>{formatDate(item.date)}</span>
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
                    <Link to={item.url}>Visualizar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-center pt-2">
        <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">
          Ver todos
        </Button>
      </div>
    </div>
  );
};
