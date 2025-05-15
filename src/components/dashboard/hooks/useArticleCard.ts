
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';

export const useArticleCard = (issue: Issue) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch bookmark status
  const { data: isBookmarked = false, isLoading: isLoadingBookmark } = useQuery({
    queryKey: ['issue-bookmark', issue.id],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('*')
          .eq('issue_id', issue.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return !!data;
      } catch (err) {
        console.error('Error fetching bookmark status:', err);
        return false;
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Check user's reactions
  const { data: hasLiked = false, isLoading: isLoadingReactions } = useQuery({
    queryKey: ['issue-like', issue.id],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
          .from('user_article_reactions')
          .select('*')
          .eq('issue_id', issue.id)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like')
          .maybeSingle();
        
        if (error) throw error;
        return !!data;
      } catch (err) {
        console.error('Error fetching like status:', err);
        return false;
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Toggle bookmark
  const toggleBookmark = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('issue_id', issue.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'remove' };
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            issue_id: issue.id,
            article_id: issue.id, // For backward compatibility
            user_id: user.id 
          });
        
        if (error) throw error;
        return { action: 'add' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['issue-bookmark', issue.id] });
      toast({
        description: result.action === 'add' 
          ? 'Salvo nos favoritos' 
          : 'Removido dos favoritos',
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: 'Erro ao gerenciar favorito',
      });
    },
  });

  // Toggle like reaction
  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (hasLiked) {
        const { error } = await supabase
          .from('user_article_reactions')
          .delete()
          .eq('issue_id', issue.id)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like');
        
        if (error) throw error;
        return { action: 'remove' };
      } else {
        const { error } = await supabase
          .from('user_article_reactions')
          .insert({ 
            issue_id: issue.id,
            article_id: issue.id, // For backward compatibility
            user_id: user.id,
            reaction_type: 'like'
          });
        
        if (error) throw error;
        return { action: 'add' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['issue-like', issue.id] });
      if (result.action === 'add') {
        toast({ description: 'Você curtiu esta edição' });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: 'Erro ao registrar reação',
      });
    },
  });
  
  // Handle deleting an issue
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta edição?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issue.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({
        description: 'Edição excluída com sucesso',
      });
    } catch (err) {
      console.error('Error deleting issue:', err);
      toast({
        variant: "destructive",
        description: 'Erro ao excluir edição',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    isBookmarked,
    hasLiked,
    isDeleting,
    isLoadingBookmark,
    isLoadingReactions,
    toggleBookmark,
    toggleLike,
    handleDelete
  };
};
