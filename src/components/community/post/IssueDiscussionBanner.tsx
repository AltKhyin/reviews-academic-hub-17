
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';

interface IssueDiscussionBannerProps {
  issueId: string;
}

export const IssueDiscussionBanner: React.FC<IssueDiscussionBannerProps> = ({ issueId }) => {
  const navigate = useNavigate();
  const [issueCoverUrl, setIssueCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssueCover = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('cover_image_url')
        .eq('id', issueId)
        .single();
      
      if (data?.cover_image_url) {
        setIssueCoverUrl(data.cover_image_url);
      }
    };
    
    fetchIssueCover();
  }, [issueId]);

  if (!issueCoverUrl) return null;

  return (
    <div 
      className="mt-4 mb-4 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] group relative"
      onClick={() => navigate(`/article/${issueId}`)}
    >
      <div 
        className="relative h-20 bg-cover bg-center flex items-center"
        style={{ 
          backgroundImage: `url(${issueCoverUrl})`,
        }}
      >
        {/* Dark gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/20 transition-all duration-300"></div>
        
        {/* Content */}
        <div className="relative flex-1 px-4 flex items-center justify-between z-10">
          <span className="text-sm text-white font-medium group-hover:text-yellow-100 transition-colors drop-shadow-lg">
            Esta discussão refere-se a uma edição publicada.
          </span>
          <ExternalLink className="h-4 w-4 text-white group-hover:text-yellow-200 transition-colors drop-shadow-lg" />
        </div>
        
        {/* Subtle border for definition */}
        <div className="absolute inset-0 border border-white/10 rounded-lg"></div>
      </div>
    </div>
  );
};
