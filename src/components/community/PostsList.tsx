
import React from 'react';
import { Post } from '@/components/community/Post';
import { EmptyState } from '@/components/community/EmptyState';
import { PostData } from '@/types/community';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PostsListProps {
  posts: PostData[] | undefined;
  emptyMessage: string;
  onVoteChange: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const PostsList: React.FC<PostsListProps> = ({ 
  posts, 
  emptyMessage, 
  onVoteChange,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-6">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-4 mt-1" />
                <Skeleton className="h-6 w-6 mt-1" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-24 w-full mb-4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
            <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 text-center bg-red-950/20">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar publicações</h3>
        <p className="mb-4 text-gray-400">{error.message || 'Ocorreu um erro ao buscar as publicações. Por favor, tente novamente.'}</p>
        <Button onClick={onVoteChange}>Tentar novamente</Button>
      </Card>
    );
  }
  
  if (!posts?.length) {
    return <EmptyState message={emptyMessage} />;
  }
  
  return (
    <div>
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
          <Post 
            post={post} 
            onVoteChange={onVoteChange} 
          />
          {/* No divider after the last post */}
          {index !== posts.length - 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent my-2"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
