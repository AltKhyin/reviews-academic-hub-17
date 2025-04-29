
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
            <div className="relative w-full h-0 pb-[56.25%] rounded-md overflow-hidden">
              {post.video_url.includes('mp4') || post.video_url.includes('webm') || post.video_url.includes('mov') ? (
                <video 
                  src={post.video_url} 
                  controls 
                  className="absolute top-0 left-0 w-full h-full object-contain bg-black/10 rounded-md"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    console.log('Failed video URL:', post.video_url);
                  }}
                />
              ) : (
                <iframe
                  src={post.video_url.replace('watch?v=', 'embed/')} 
                  className="absolute top-0 left-0 w-full h-full object-contain bg-black/10 rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
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
