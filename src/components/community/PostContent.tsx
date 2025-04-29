
import React, { useState } from 'react';
import { PollSection } from '@/components/community/PollSection';
import { PostData } from '@/types/community';

interface PostContentProps {
  post: PostData;
  onVoteChange: () => void;
}

export const PostContent: React.FC<PostContentProps> = ({ post, onVoteChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const shouldTruncate = post.content && post.content.length > 300 && !isExpanded;
  
  return (
    <>
      {post.content && (
        <div className="mt-3 text-sm">
          <p className={shouldTruncate ? "line-clamp-3" : ""}>
            {post.content}
          </p>
          {shouldTruncate && (
            <button 
              onClick={toggleExpand} 
              className="text-blue-500 hover:text-blue-700 text-sm mt-1 font-medium"
            >
              Ler mais
            </button>
          )}
        </div>
      )}
      
      {(post.image_url || post.video_url) && (
        <div className="mt-4">
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="rounded-md max-h-96 w-full object-contain bg-black/5" 
            />
          )}
          {post.video_url && (
            <video 
              src={post.video_url} 
              controls 
              className="rounded-md w-full max-h-96" 
              preload="metadata"
              onError={(e) => console.error('Video loading error:', e)}
            />
          )}
        </div>
      )}
      
      {/* Poll UI */}
      {post.poll && (
        <PollSection poll={post.poll} onVoteChange={onVoteChange} />
      )}
    </>
  );
};
