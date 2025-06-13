
// ABOUTME: Simplified posts list using individual focused hooks
// Uses React Query's natural caching instead of complex centralized loading
import React from 'react';
import { useSimplePosts } from '@/hooks/community/useSimplePosts';
import { usePostProfiles } from '@/hooks/community/usePostProfiles';
import { usePostFlairs } from '@/hooks/community/usePostFlairs';
import { Post } from '@/components/community/Post';
import { NewPostModal } from '@/components/community/NewPostModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const PostsList: React.FC = () => {
  const [showNewPostModal, setShowNewPostModal] = React.useState(false);
  
  // Load data with simple, focused hooks
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useSimplePosts();
  const userIds = React.useMemo(() => posts.map(post => post.user_id), [posts]);
  const { data: profiles = [] } = usePostProfiles(userIds);
  const { data: flairs = [] } = usePostFlairs();

  console.log('PostsList: Rendering with', posts.length, 'posts');

  if (postsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Community</h1>
          <Button disabled className="opacity-50">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
        
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Error loading community</h2>
        <p className="text-gray-600 mb-4">
          Unable to load community posts. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Community</h1>
          <Button onClick={() => setShowNewPostModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
        
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No posts available yet</h2>
          <p className="text-gray-600 mb-4">Be the first to share something!</p>
          <Button onClick={() => setShowNewPostModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Post
          </Button>
        </div>
        
        <NewPostModal 
          isOpen={showNewPostModal} 
          onClose={() => setShowNewPostModal(false)}
        />
      </>
    );
  }

  // Create lookup maps for efficient data joining
  const profilesMap = React.useMemo(() => 
    new Map(profiles.map(profile => [profile.id, profile])), 
    [profiles]
  );
  
  const flairsMap = React.useMemo(() => 
    new Map(flairs.map(flair => [flair.id, flair])), 
    [flairs]
  );

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.pinned);
  const regularPosts = posts.filter(post => !post.pinned);

  // Enhance posts with profile and flair data
  const enhancePost = (post: any) => ({
    ...post,
    profiles: profilesMap.get(post.user_id) || null,
    post_flairs: post.flair_id ? flairsMap.get(post.flair_id) || null : null,
    comment_count: 0, // Will be loaded by Post component if needed
    user_vote: 0, // Will be loaded by Post component if needed
    poll: null, // Will be loaded by Post component if needed
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community</h1>
        <Button onClick={() => setShowNewPostModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="space-y-4">
        {/* Pinned posts first */}
        {pinnedPosts.map((post) => (
          <Post 
            key={`pinned-${post.id}`} 
            post={enhancePost(post)}
            isPinned={true}
          />
        ))}
        
        {/* Regular posts */}
        {regularPosts.map((post) => (
          <Post 
            key={post.id} 
            post={enhancePost(post)}
            isPinned={false}
          />
        ))}
      </div>

      <NewPostModal 
        isOpen={showNewPostModal} 
        onClose={() => setShowNewPostModal(false)}
      />
    </>
  );
};
