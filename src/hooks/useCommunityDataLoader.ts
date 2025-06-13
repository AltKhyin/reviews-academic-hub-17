// ABOUTME: Community-specific parallel data loader to eliminate API cascade
// Replaces individual useQuery calls with centralized data management
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  user_id: string;
  flair_id?: string;
  published: boolean;
  score: number;
  created_at: string;
  updated_at: string;
  poll_id?: string;
  pinned?: boolean;
  pinned_at?: string;
  pinned_by?: string;
  issue_id?: string;
  auto_generated?: boolean;
  pin_duration_days?: number;
  // Joined data
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
  post_flairs?: {
    name: string;
    color: string;
  };
  comment_count?: number;
  user_vote?: number;
  // Required for Post component compatibility
  poll?: any;
}

export interface CommunitySettings {
  id: string;
  allow_polls: boolean;
  header_image_url?: string;
  theme_color: string;
  description?: string;
}

export interface CommunityDataState {
  posts: Post[];
  communitySettings: CommunitySettings | null;
  postFlairs: Array<{ id: string; name: string; color: string }>;
  isLoading: boolean;
  errors: Record<string, Error>;
  retryFailed: () => void;
}

interface DataLoader {
  key: string;
  loader: () => Promise<any>;
  critical: boolean;
}

export const useCommunityDataLoader = (): CommunityDataState => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [state, setState] = useState<CommunityDataState>({
    posts: [],
    communitySettings: null,
    postFlairs: [],
    isLoading: true,
    errors: {},
    retryFailed: () => {},
  });

  // Load posts with all related data in a single optimized query
  const loadPosts = async (): Promise<Post[]> => {
    try {
      console.log('useCommunityDataLoader: Loading posts with optimized query...');
      
      // Single optimized query with JOINs instead of multiple queries
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          post_flairs:flair_id(name, color),
          comments:post_id(count)
        `)
        .eq('published', true)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading posts:', error);
        throw error;
      }
      
      // Transform data to include comment counts and user votes if authenticated
      const posts = data?.map(post => ({
        ...post,
        comment_count: post.comments?.length || 0,
        user_vote: 0, // Will be loaded separately if authenticated
        poll: null // Add default poll value
      })) || [];

      // If authenticated, load user votes in a single batch query
      if (isAuthenticated && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: votes } = await supabase
          .from('post_votes')
          .select('post_id, value')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        // Map votes back to posts
        if (votes) {
          const voteMap = new Map(votes.map(v => [v.post_id, v.value]));
          posts.forEach(post => {
            post.user_vote = voteMap.get(post.id) || 0;
          });
        }
      }
      
      console.log('useCommunityDataLoader: Successfully loaded', posts.length, 'posts');
      return posts;
    } catch (error) {
      console.error('Failed to load posts:', error);
      return [];
    }
  };

  // Load community settings
  const loadCommunitySettings = async (): Promise<CommunitySettings | null> => {
    try {
      console.log('useCommunityDataLoader: Loading community settings...');
      const { data, error } = await supabase
        .from('community_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading community settings:', error);
        throw error;
      }
      
      console.log('useCommunityDataLoader: Community settings loaded');
      return data;
    } catch (error) {
      console.error('Failed to load community settings:', error);
      return null;
    }
  };

  // Load post flairs
  const loadPostFlairs = async (): Promise<Array<{ id: string; name: string; color: string }>> => {
    try {
      console.log('useCommunityDataLoader: Loading post flairs...');
      const { data, error } = await supabase
        .from('post_flairs')
        .select('id, name, color')
        .order('name');

      if (error) {
        console.error('Error loading post flairs:', error);
        throw error;
      }
      
      console.log('useCommunityDataLoader: Successfully loaded', data?.length || 0, 'post flairs');
      return data || [];
    } catch (error) {
      console.error('Failed to load post flairs:', error);
      return [];
    }
  };

  // Define data loaders
  const dataLoaders: DataLoader[] = [
    {
      key: 'posts',
      loader: loadPosts,
      critical: true,
    },
    {
      key: 'communitySettings',
      loader: loadCommunitySettings,
      critical: false,
    },
    {
      key: 'postFlairs',
      loader: loadPostFlairs,
      critical: false,
    },
  ];

  // Execute parallel data loading
  const loadData = useCallback(async () => {
    console.log('useCommunityDataLoader: Starting comprehensive community data load...');
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));

    const results = await Promise.allSettled(
      dataLoaders.map(async loader => ({
        key: loader.key,
        data: await loader.loader(),
        critical: loader.critical,
      }))
    );

    const newState: Partial<CommunityDataState> = { isLoading: false, errors: {} };
    const errors: Record<string, Error> = {};

    results.forEach((result, index) => {
      const loader = dataLoaders[index];
      
      if (result.status === 'fulfilled') {
        (newState as any)[loader.key] = result.value.data;
        console.log(`useCommunityDataLoader: Successfully loaded ${loader.key}:`, 
          Array.isArray(result.value.data) ? `${result.value.data.length} items` : result.value.data ? 'data loaded' : 'no data');
      } else {
        errors[loader.key] = result.reason;
        console.error(`useCommunityDataLoader: Failed to load ${loader.key}:`, result.reason);
        
        // Set safe defaults for failed loads
        switch (loader.key) {
          case 'posts':
            (newState as any)[loader.key] = [];
            break;
          case 'communitySettings':
            (newState as any)[loader.key] = null;
            break;
          case 'postFlairs':
            (newState as any)[loader.key] = [];
            break;
        }
      }
    });

    newState.errors = errors;
    
    console.log('useCommunityDataLoader: Data load complete. Final state:', {
      postsCount: (newState as any).posts?.length || 0,
      settingsLoaded: !!(newState as any).communitySettings,
      flairsCount: (newState as any).postFlairs?.length || 0,
      errorsCount: Object.keys(errors).length
    });
    
    setState(prev => ({ ...prev, ...newState }));
  }, [isAuthenticated, user?.id]);

  // Retry failed data loads
  const retryFailed = useCallback(() => {
    console.log('useCommunityDataLoader: Retrying failed loads...');
    loadData();
  }, [loadData]);

  // Load data on mount and auth changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    retryFailed,
  };
};
