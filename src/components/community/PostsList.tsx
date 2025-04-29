
import React from 'react';
import { Post } from '@/components/community/Post';
import { EmptyState } from '@/components/community/EmptyState';
import { PostData } from '@/types/community';

interface PostsListProps {
  posts: PostData[] | undefined;
  emptyMessage: string;
  onVoteChange: () => void;
}

export const PostsList: React.FC<PostsListProps> = ({ 
  posts, 
  emptyMessage, 
  onVoteChange 
}) => {
  if (!posts?.length) {
    return <EmptyState message={emptyMessage} />;
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onVoteChange={onVoteChange} 
        />
      ))}
    </div>
  );
};
