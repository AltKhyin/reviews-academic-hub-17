
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CommunitySettings, PostData } from '@/types/community';

export function useCommunityPosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['community-posts', activeTab, searchTerm],
    queryFn: async () => {
      // First, fetch all posts
      let query = supabase
        .from('posts')
        .select(`
          *
        `)
        .eq('published', true);
      
      // Add search filter if searchTerm is provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (activeTab === 'popular') {
        query = query.order('score', { ascending: false });
      } else if (activeTab === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        // Default is latest (newest first)
        query = query.order('created_at', { ascending: false });
      }

      // For "my" tab, filter by current user
      if (activeTab === 'my' && user) {
        query = query.eq('user_id', user.id);
      }

      const { data: posts, error } = await query;
      
      if (error) throw error;
      if (!posts) return [];
      
      // Now fetch profiles for these posts
      const userIds = posts.map(post => post.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      // Fetch flairs
      const flairIds = posts.filter(post => post.flair_id).map(post => post.flair_id);
      const { data: flairs } = await supabase
        .from('post_flairs')
        .select('*')
        .in('id', flairIds.length > 0 ? flairIds : ['no-flairs']);
      
      // Fetch poll data for posts with polls
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Find the profile for this post
          const profile = profiles?.find(p => p.id === post.user_id);
          // Find the flair for this post
          const postFlair = flairs?.find(f => f.id === post.flair_id);
          
          const enhancedPost = {
            ...post,
            profiles: profile ? {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            } : null,
            post_flairs: postFlair || null,
            poll: null as any
          };
          
          if (!post.poll_id) return enhancedPost;
          
          // Fetch poll options
          const { data: pollOptions } = await supabase
            .from('poll_options')
            .select('id, text, position')
            .eq('poll_id', post.poll_id)
            .order('position');
            
          if (!pollOptions) return enhancedPost;
            
          // Fetch vote counts for each option
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
            ...enhancedPost,
            poll: {
              id: post.poll_id,
              options: optionsWithVotes,
              total_votes: totalVotes,
              user_vote: userVote
            }
          };
        })
      );
      
      return postsWithDetails as PostData[];
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

export function useCommunitySettings() {
  return useQuery<CommunitySettings>({
    queryKey: ['community-settings'],
    queryFn: async () => {
      try {
        // Since the database table might not be in the TypeScript types yet,
        // use REST API directly with proper typing
        const response = await fetch(
          'https://kznasfgubbyinomtetiu.supabase.co/rest/v1/community_settings?select=*&limit=1',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bmFzZmd1YmJ5aW5vbXRldGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg4NzMsImV4cCI6MjA2MTI0NDg3M30.Fx7xl_EA_G8SVVjWyVRu61kWhwkrbFlZsulQz_WKx7Q',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch community settings: ${response.statusText}`);
        }
        
        const settings = await response.json();
        
        // If no settings found, return default
        if (!settings || settings.length === 0) {
          // Create default settings
          const defaultSettings: Omit<CommunitySettings, 'id' | 'created_at' | 'updated_at'> = {
            header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
            theme_color: '#1e40af',
            description: 'Comunidade científica para discussão de evidências médicas',
            allow_polls: true
          };
          
          // Insert default settings
          const insertResponse = await fetch(
            'https://kznasfgubbyinomtetiu.supabase.co/rest/v1/community_settings',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bmFzZmd1YmJ5aW5vbXRldGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg4NzMsImV4cCI6MjA2MTI0NDg3M30.Fx7xl_EA_G8SVVjWyVRu61kWhwkrbFlZsulQz_WKx7Q',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
              },
              body: JSON.stringify(defaultSettings)
            }
          );
          
          if (!insertResponse.ok) {
            throw new Error(`Failed to create default community settings: ${insertResponse.statusText}`);
          }
          
          const newSettings = await insertResponse.json();
          return newSettings as CommunitySettings;
        }
        
        return settings[0] as CommunitySettings;
      } catch (error) {
        console.error("Error fetching community settings:", error);
        
        // Return default settings as fallback
        return {
          id: 'default',
          header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
          theme_color: '#1e40af',
          description: 'Comunidade científica para discussão de evidências médicas',
          allow_polls: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
  });
}
