
import React, { useState } from 'react';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CarouselArticleCardProps {
  issue: Issue;
  className?: string;
}

export const CarouselArticleCard: React.FC<CarouselArticleCardProps> = ({ 
  issue, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(`/article/${issue.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${action} clicked for issue:`, issue.id);
    // Action handlers would be implemented here
  };

  return (
    <a 
      href={`/article/${issue.id}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative rounded-md overflow-hidden h-[360px] w-[202px] cursor-pointer group ${className}`}>
        <img 
          src={issue.cover_image_url || '/placeholder.svg'} 
          alt={issue.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 hover:brightness-75"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Specialty tag - always visible at bottom left */}
        <div className="absolute bottom-4 left-4 opacity-100 transition-opacity">
          <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
            {issue.specialty || ''}
          </span>
        </div>

        {/* Bookmark button - appears on hover at top right */}
        <div className={`absolute top-4 right-4 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
            onClick={(e) => handleActionClick(e, 'bookmark')}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons - appear on hover at bottom right */}
        <div className={`absolute bottom-4 right-4 transition-opacity flex gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
            onClick={(e) => handleActionClick(e, 'heart')}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button 
            className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
            onClick={(e) => handleActionClick(e, 'thumbs-up')}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button 
            className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
            onClick={(e) => handleActionClick(e, 'thumbs-down')}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
};

export default CarouselArticleCard;
