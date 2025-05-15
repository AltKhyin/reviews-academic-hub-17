
import React from 'react';
import { Button } from '@/components/ui/button';
import { SavedItemCard } from './SavedItemCard';

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
  
  return (
    <div className="space-y-4">
      {items.map(item => (
        <SavedItemCard 
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          author={item.author}
          date={item.date}
          url={item.url}
        />
      ))}
      
      <div className="text-center pt-2">
        <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">
          Ver todos
        </Button>
      </div>
    </div>
  );
};
