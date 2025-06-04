
// ABOUTME: Community page with integrated right sidebar using seamless background integration
// Uses grid layout with main content and sidebar, ensuring visual harmony

import React, { useState } from 'react';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { PostsList } from '@/components/community/PostsList';
import { usePosts, enhancePostsWithDetails } from '@/hooks/community';
import { useQuery } from '@tanstack/react-query';

export const Community = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: posts, isLoading, error, refetch } = usePosts(activeTab, searchTerm);
  
  const { data: enhancedPosts, isLoading: isEnhancing } = useQuery({
    queryKey: ['enhanced-posts', posts],
    queryFn: () => enhancePostsWithDetails(posts || []),
    enabled: !!posts,
    staleTime: 30000,
  });

  const handleVoteChange = () => {
    refetch();
  };

  const getEmptyMessage = () => {
    if (searchTerm) return 'Nenhuma publicação encontrada para sua busca.';
    if (activeTab === 'my') return 'Você ainda não criou nenhuma publicação.';
    return 'Nenhuma publicação encontrada.';
  };

  return (
    <div className="h-full bg-background text-foreground">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
        {/* Main Content Area */}
        <div className="flex flex-col h-full overflow-hidden">
          <CommunityHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <PostsList 
                posts={enhancedPosts}
                emptyMessage={getEmptyMessage()}
                onVoteChange={handleVoteChange}
                isLoading={isLoading || isEnhancing}
                error={error}
              />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Desktop Only, seamless background */}
        <div className="hidden lg:block h-full bg-background overflow-y-auto">
          <RightSidebar className="h-full" />
        </div>
      </div>
    </div>
  );
};
