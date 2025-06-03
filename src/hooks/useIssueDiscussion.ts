
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { IssueDiscussionSettings } from '@/types/community';

export function useIssueDiscussionSettings(issueId?: string) {
  return useQuery({
    queryKey: ['issue-discussion-settings', issueId],
    queryFn: async () => {
      if (!issueId) return null;
      
      const { data, error } = await supabase
        .from('issue_discussion_settings')
        .select('*')
        .eq('issue_id', issueId)
        .maybeSingle();
      
      if (error) throw error;
      return data as IssueDiscussionSettings | null;
    },
    enabled: !!issueId
  });
}

export function useCreateDiscussionPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      issueTitle, 
      discussionContent, 
      includeReadButton, 
      pinDurationDays 
    }: {
      issueId: string;
      issueTitle: string;
      discussionContent: string;
      includeReadButton: boolean;
      pinDurationDays: number;
    }) => {
      // First, get the "Discussão de Edição" flair
      const { data: flair } = await supabase
        .from('post_flairs')
        .select('id')
        .eq('name', 'Discussão de Edição')
        .single();

      if (!flair) {
        throw new Error('Flair "Discussão de Edição" não encontrada');
      }

      // Create the discussion post
      const postData = {
        title: `Discussão: ${issueTitle}`,
        content: discussionContent || `Este espaço é dedicado para discutirmos esta edição. Compartilhe suas impressões, dúvidas e insights.`,
        published: true,
        flair_id: flair.id,
        issue_id: issueId,
        auto_generated: true,
        pinned: true,
        pinned_at: new Date().toISOString(),
        pin_duration_days: pinDurationDays
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;

      // Save discussion settings
      const settingsData = {
        issue_id: issueId,
        discussion_content: discussionContent,
        include_read_button: includeReadButton,
        pin_duration_days: pinDurationDays
      };

      const { error: settingsError } = await supabase
        .from('issue_discussion_settings')
        .upsert(settingsData);

      if (settingsError) throw settingsError;

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Discussão criada!",
        description: "A discussão da edição foi criada e fixada na comunidade.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar discussão",
        description: error.message || "Não foi possível criar a discussão automática.",
        variant: "destructive",
      });
    }
  });
}

export function usePinPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, pinDurationDays }: { postId: string; pinDurationDays: number }) => {
      const { error } = await supabase
        .from('posts')
        .update({
          pinned: true,
          pinned_at: new Date().toISOString(),
          pin_duration_days: pinDurationDays
        })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Post fixado!",
        description: "A publicação foi fixada no topo da comunidade.",
      });
    }
  });
}

export function useUnpinPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .update({
          pinned: false,
          pinned_at: null,
          pinned_by: null
        })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Post desafixado!",
        description: "A publicação foi removida do topo da comunidade.",
      });
    }
  });
}
