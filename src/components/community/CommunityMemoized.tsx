
// ABOUTME: Memoized community components for optimal performance with zero visual changes
import React, { memo, useMemo } from 'react';
import { PostsList } from './PostsList';
import { CommunityHeader } from './CommunityHeader';

interface MemoizedPostsListProps {
  posts: any[];
  emptyMessage: string;
  onVoteChange: () => void;
  isLoading: boolean;
  error: any;
}

// Memoized PostsList to prevent unnecessary re-renders
export const MemoizedPostsList = memo<MemoizedPostsListProps>(({
  posts,
  emptyMessage,
  onVoteChange,
  isLoading,
  error
}) => {
  console.log('MemoizedPostsList: Rendering with', posts?.length || 0, 'posts');
  
  return (
    <PostsList 
      posts={posts}
      emptyMessage={emptyMessage}
      onVoteChange={onVoteChange}
      isLoading={isLoading}
      error={error}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  const postsEqual = prevProps.posts?.length === nextProps.posts?.length &&
    prevProps.posts?.every((post, index) => 
      post.id === nextProps.posts?.[index]?.id &&
      post.score === nextProps.posts?.[index]?.score &&
      post.comment_count === nextProps.posts?.[index]?.comment_count
    );
  
  return postsEqual && 
    prevProps.emptyMessage === nextProps.emptyMessage &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error;
});

MemoizedPostsList.displayName = 'MemoizedPostsList';

// Memoized CommunityHeader to prevent unnecessary re-renders
export const MemoizedCommunityHeader = memo(() => {
  return <CommunityHeader />;
});

MemoizedCommunityHeader.displayName = 'MemoizedCommunityHeader';
