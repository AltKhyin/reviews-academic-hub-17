
// ABOUTME: Optimized posts list using centralized data management
// Eliminates individual API calls per post component
import React from 'react';
import { useCommunityData } from '@/contexts/CommunityDataContext';
import { Post } from '@/components/community/Post';
import { EmptyState } from '@/components/community/EmptyState';
import { NewPostModal } from '@/components/community/NewPostModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const PostsList: React.FC = () => {
  const { posts, isLoading, errors, retryFailed } = useCommunityData();
  const [showNewPostModal, setShowNewPostModal] = React.useState(false);

  console.log('PostsList: Rendering with', posts.length, 'posts from centralized data');

  if (isLoading) {
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

  if (Object.keys(errors).length > 0 && posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Error loading community</h2>
        <p className="text-gray-600 mb-4">
          Unable to load community posts. Please try again.
        </p>
        <Button onClick={retryFailed}>
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
        
        <EmptyState message="No posts available yet. Be the first to share something!" />
        
        <NewPostModal 
          isOpen={showNewPostModal} 
          onClose={() => setShowNewPostModal(false)}
        />
      </>
    );
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.pinned);
  const regularPosts = posts.filter(post => !post.pinned);

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
            post={post}
            isPinned={true}
            // Pass centralized data to avoid individual API calls
            userVote={post.user_vote}
            commentCount={post.comment_count}
          />
        ))}
        
        {/* Regular posts */}
        {regularPosts.map((post) => (
          <Post 
            key={post.id} 
            post={post}
            isPinned={false}
            // Pass centralized data to avoid individual API calls
            userVote={post.user_vote}
            commentCount={post.comment_count}
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
