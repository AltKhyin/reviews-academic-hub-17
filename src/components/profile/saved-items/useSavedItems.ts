
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  coverImage?: string;
  tags?: string[];
  status?: 'published' | 'draft';
}

export const useSavedItems = (userId?: string, type: 'reviews' | 'posts' = 'reviews') => {
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
          // Fetch bookmarked issues or "want_more" reactions
          const { data: bookmarkedData, error: bookmarkError } = await supabase
            .from('user_bookmarks')
            .select(`
              id,
              created_at,
              issue_id,
              issues:issue_id (
                id,
                title,
                description,
                published_at,
                cover_image_url,
                specialty,
                published
              )
            `)
            .eq('user_id', userId)
            .is('article_id', null)
            .not('issue_id', 'is', null)
            .order('created_at', { ascending: false });
            
          if (bookmarkError) {
            console.error('Error fetching bookmarks:', bookmarkError);
            throw bookmarkError;
          }

          // Also fetch "want_more" reactions
          const { data: reactionsData, error: reactionsError } = await supabase
            .from('user_article_reactions')
            .select(`
              id,
              created_at,
              reaction_type,
              issue_id,
              issues:issue_id (
                id,
                title,
                description,
                published_at,
                cover_image_url,
                specialty,
                published
              )
            `)
            .eq('user_id', userId)
            .eq('reaction_type', 'want_more')
            .is('article_id', null)
            .not('issue_id', 'is', null)
            .order('created_at', { ascending: false });
            
          if (reactionsError) {
            console.error('Error fetching reactions:', reactionsError);
            throw reactionsError;
          }
          
          // Combine and deduplicate the results
          const combinedItems: SavedItem[] = [];
          const seenIssueIds = new Set();
          
          // Process bookmarked items
          if (bookmarkedData && bookmarkedData.length > 0) {
            bookmarkedData.forEach(bookmark => {
              if (bookmark.issues && !seenIssueIds.has(bookmark.issues.id)) {
                seenIssueIds.add(bookmark.issues.id);
                
                // Split specialty into tags if available
                const tags = bookmark.issues.specialty ? 
                  bookmark.issues.specialty.split(',').map(tag => tag.trim()) : 
                  [];
                
                combinedItems.push({
                  id: bookmark.id,
                  title: bookmark.issues.title || 'Review sem título',
                  description: bookmark.issues.description || 'Sem descrição',
                  author: {
                    name: 'Reviews.',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reviews'
                  },
                  date: bookmark.created_at,
                  url: `/article/${bookmark.issues.id}`,
                  coverImage: bookmark.issues.cover_image_url,
                  tags: tags,
                  status: bookmark.issues.published ? 'published' : 'draft'
                });
              }
            });
          }
          
          // Process reaction items
          if (reactionsData && reactionsData.length > 0) {
            reactionsData.forEach(reaction => {
              if (reaction.issues && !seenIssueIds.has(reaction.issues.id)) {
                seenIssueIds.add(reaction.issues.id);
                
                // Split specialty into tags if available
                const tags = reaction.issues.specialty ? 
                  reaction.issues.specialty.split(',').map(tag => tag.trim()) : 
                  [];
                
                combinedItems.push({
                  id: reaction.id,
                  title: reaction.issues.title || 'Review sem título',
                  description: reaction.issues.description || 'Sem descrição',
                  author: {
                    name: 'Reviews.',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reviews'
                  },
                  date: reaction.created_at,
                  url: `/article/${reaction.issues.id}`,
                  coverImage: reaction.issues.cover_image_url,
                  tags: tags,
                  status: reaction.issues.published ? 'published' : 'draft'
                });
              }
            });
          }
          
          // Sort by date (newest first)
          combinedItems.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setItems(combinedItems);
        } else {
          // Try to fetch real post bookmarks
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
            // Example data for posts
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
        
        // Fallback data in case of error
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

  return { items, loading };
};
