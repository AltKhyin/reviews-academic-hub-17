
// ABOUTME: PostsList component with fixed React Fragment key prop error and optimized rendering
import React, { memo } from 'react';
import { Post } from './Post';
import { PostData } from '@/types/community';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PostsListProps {
  posts: PostData[] | undefined;
  emptyMessage: string;
  onVoteChange: () => void;
  isLoading?: boolean;
  error?: any;
}

export const PostsList: React.FC<PostsListProps> = memo(({ 
  posts, 
  emptyMessage, 
  onVoteChange, 
  isLoading = false,
  error 
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Carregando publicações...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="py-6">
          <p className="text-center text-red-400">
            Erro ao carregar publicações. Tente novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <Card className="border-gray-700/30 bg-gray-800/10">
        <CardContent className="py-12">
          <p className="text-center text-gray-400">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Posts list - Fixed: Remove React.Fragment with key prop
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="border-b border-gray-700/20 last:border-b-0">
          <Post 
            post={post} 
            onVoteChange={onVoteChange}
          />
        </div>
      ))}
    </div>
  );
});

PostsList.displayName = 'PostsList';
