import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ArticleFormData {
  title: string;
  content: string;
  summary?: string;
  image_url?: string;
  published?: boolean;
}

export const useArticles = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (formData: ArticleFormData) => {
      if (!user) throw new Error('You must be logged in to create an article');

      const { data, error } = await supabase
        .from('articles')
        .insert({
          ...formData,
          author_id: user.id,
          published: formData.published || false,
          published_at: formData.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: 'Article created',
        description: 'The article has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, ...formData }: ArticleFormData & { id: string }) => {
      const updateData = { ...formData };
      
      // Add published_at if article is being published
      if (formData.published) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: 'Article updated',
        description: 'The article has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: 'Article deleted',
        description: 'The article has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    articles,
    isLoading,
    createArticle: createArticleMutation.mutate,
    updateArticle: updateArticleMutation.mutate,
    deleteArticle: deleteArticleMutation.mutate,
    isCreating: createArticleMutation.isPending,
    isUpdating: updateArticleMutation.isPending,
    isDeleting: deleteArticleMutation.isPending,
  };
};
