
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

interface ProfileSavedItemsProps {
  userId?: string;
  type: 'reviews' | 'posts';
}

export const ProfileSavedItems: React.FC<ProfileSavedItemsProps> = ({ userId, type }) => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        if (type === 'reviews') {
          // Implementação futura: buscar reviews favoritas
          // Por enquanto, usamos dados mockados
          setItems([
            {
              id: '1',
              title: 'Análise de anticoagulantes de nova geração',
              description: 'Comparação de eficácia entre medicamentos recentes',
              author: { 
                name: 'Dra. Maria Silva', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' 
              },
              date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
              url: '/article/1'
            },
            {
              id: '2',
              title: 'Meta-análise sobre antidepressivos',
              description: 'Estudo sobre eficácia comparada em tratamentos prolongados',
              author: { 
                name: 'Dr. João Cardoso', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao' 
              },
              date: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
              url: '/article/2'
            },
            {
              id: '3',
              title: 'Protocolo de tratamento para diabetes tipo 2',
              description: 'Novas diretrizes baseadas em evidências recentes',
              author: { 
                name: 'Dra. Ana Martins', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' 
              },
              date: new Date(Date.now() - 21*24*60*60*1000).toISOString(),
              url: '/article/3'
            }
          ]);
        } else {
          // Implementação futura: buscar posts salvos
          // Por enquanto, tentamos buscar bookmarks reais
          const { data: bookmarkData, error: bookmarkError } = await supabase
            .from('post_bookmarks')
            .select(`
              id,
              created_at,
              post_id,
              posts:post_id (
                id,
                title,
                content,
                created_at,
                user_id
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (bookmarkError) {
            console.error('Error fetching bookmarks:', bookmarkError);
            throw bookmarkError;
          }
          
          if (bookmarkData && bookmarkData.length > 0) {
            // Fetch user profiles separately to avoid relation errors
            const postUserIds = bookmarkData
              .map(bookmark => bookmark.posts?.user_id)
              .filter(Boolean);
            
            // Get profiles for the post authors
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', postUserIds);
            
            // Create a map of user_id to profile data for easy lookup
            const profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
              if (profile.id) map[profile.id] = profile;
              return map;
            }, {});
            
            const formattedItems = bookmarkData.map(bookmark => {
              const post = bookmark.posts;
              const profile = post?.user_id ? profilesMap[post.user_id] : null;
              
              return {
                id: bookmark.id,
                title: post?.title || 'Post sem título',
                description: post?.content?.substring(0, 100) || 'Sem descrição',
                author: {
                  name: profile?.full_name || 'Usuário anônimo',
                  avatar: profile?.avatar_url
                },
                date: bookmark.created_at,
                url: `/community?post=${post?.id}`
              };
            });
            
            setItems(formattedItems);
          } else {
            // Dados de exemplo
            setItems([
              {
                id: '4',
                title: 'Discussão sobre novos tratamentos para hipertensão',
                description: 'Quais são as experiências com os novos medicamentos?',
                author: { 
                  name: 'Dr. Ricardo Melo', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo' 
                },
                date: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                url: '/community?post=4'
              },
              {
                id: '5',
                title: 'Pesquisa sobre burnout na medicina',
                description: 'Compartilhando dados sobre saúde mental entre profissionais',
                author: { 
                  name: 'Dra. Júlia Alves', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia' 
                },
                date: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
                url: '/community?post=5'
              }
            ]);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ${type === 'reviews' ? 'reviews' : 'posts'} salvos:`, error);
        toast({
          title: `Erro ao carregar ${type === 'reviews' ? 'reviews' : 'posts'}`,
          description: "Não foi possível carregar os itens salvos",
          variant: "destructive"
        });
        
        // Usamos dados mockados em caso de erro
        setItems([
          {
            id: 'fallback1',
            title: type === 'reviews' ? 'Review exemplo' : 'Post exemplo',
            description: 'Conteúdo indisponível no momento',
            author: { name: 'Autor' },
            date: new Date().toISOString(),
            url: '#'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedItems();
  }, [userId, type]);
  
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };
  
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
        <Card key={item.id} className="bg-[#212121] hover:bg-[#2a2a2a] transition-colors border-0">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {item.author?.avatar && (
                <Avatar className="w-10 h-10 mt-1">
                  <AvatarImage src={item.author.avatar} />
                  <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                </Avatar>
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
                <a href={item.url}>
                  Visualizar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center pt-2">
        <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">
          Ver todos
        </Button>
      </div>
    </div>
  );
};
