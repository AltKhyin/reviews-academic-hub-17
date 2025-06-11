
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/community';

export async function enhancePostsWithDetails(posts: any[]): Promise<PostData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!posts.length) return [];
  
  const userIds = posts.map(post => post.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);
  
  const flairIds = posts.filter(post => post.flair_id).map(post => post.flair_id);
  let flairs = [];
  
  if (flairIds.length > 0) {
    const { data: flairsData } = await supabase
      .from('post_flairs')
      .select('*')
      .in('id', flairIds);
      
    flairs = flairsData || [];
  }
  
  let userVotes: Record<string, number> = {};
  
  if (user) {
    const { data: votesData } = await supabase
      .from('post_votes')
      .select('post_id, value')
      .eq('user_id', user.id)
      .in('post_id', posts.map(p => p.id));
      
    if (votesData) {
      userVotes = votesData.reduce((acc: Record<string, number>, vote) => {
        acc[vote.post_id] = vote.value;
        return acc;
      }, {});
    }
  }
  
  const postsWithDetails = await Promise.all(
    posts.map(async (post) => {
      const profile = profiles?.find(p => p.id === post.user_id);
      const postFlair = flairs.find((f: any) => f.id === post.flair_id);
      
      const enhancedPost: PostData = {
        ...post,
        profiles: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : null,
        post_flairs: postFlair || null,
        poll: null,
        userVote: userVotes[post.id] || 0
      };
      
      if (!post.poll_id) return enhancedPost;
      
      const { data: pollOptions } = await supabase
        .from('poll_options')
        .select('id, text, position')
        .eq('poll_id', post.poll_id)
        .order('position');
        
      if (!pollOptions) return enhancedPost;
        
      const optionsWithVotes = await Promise.all(
        pollOptions.map(async (option) => {
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
      
      const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);
      
      enhancedPost.poll = {
        id: post.poll_id,
        options: optionsWithVotes,
        total_votes: totalVotes,
        user_vote: userVote
      };
      
      return enhancedPost;
    })
  );
  
  return postsWithDetails as PostData[];
}
