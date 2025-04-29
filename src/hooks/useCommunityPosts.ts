
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/community';

export function useCommunityPosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['community-posts', activeTab, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url),
          post_flairs:flair_id (id, name, color)
        `)
        .eq('published', true)
        .order('created_at', { ascending: activeTab === 'oldest' });
      
      // Add search filter if searchTerm is provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (activeTab === 'popular') {
        query = query.order('score', { ascending: false });
      }

      // For "my" tab, filter by current user
      if (activeTab === 'my' && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch poll data for posts with polls
      const postsWithPolls = await Promise.all(
        (data || []).map(async (post) => {
          if (!post.poll_id) return post;
          
          // Fetch poll options
          const { data: pollOptions } = await supabase
            .from('poll_options')
            .select('id, text, position')
            .eq('poll_id', post.poll_id)
            .order('position');
            
          // Fetch vote counts for each option
          const optionsWithVotes = await Promise.all(
            (pollOptions || []).map(async (option) => {
              const { count } = await supabase
                .from('poll_votes')
                .select('*', { count: 'exact', head: true })
                .eq('option_id', option.id);
                
              return {
                ...option,
                votes: count || 0
              };
            })
          );
          
          // Check if current user has voted
          let userVote = null;
          if (user) {
            const { data: voteData } = await supabase
              .from('poll_votes')
              .select('option_id')
              .eq('user_id', user.id)
              .in('option_id', optionsWithVotes.map(o => o.id))
              .maybeSingle();
            
            userVote = voteData?.option_id || null;
          }
          
          // Calculate total votes
          const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);
          
          return {
            ...post,
            poll: {
              id: post.poll_id,
              options: optionsWithVotes,
              total_votes: totalVotes,
              user_vote: userVote
            }
          };
        })
      );
      
      // Use type assertion to tell TypeScript this conforms to PostData[]
      return postsWithPolls as unknown as PostData[];
    },
    enabled: true,
  });
}

export function usePostFlairs() {
  return useQuery({
    queryKey: ['flairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_flairs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}
