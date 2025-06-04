
// ABOUTME: Community page with integrated right sidebar using seamless background integration
// Uses grid layout with main content and sidebar, ensuring visual harmony

import React from 'react';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { PostsList } from '@/components/community/PostsList';

export const Community = () => {
  return (
    <div className="h-full bg-background text-foreground">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
        {/* Main Content Area */}
        <div className="flex flex-col h-full overflow-hidden">
          <CommunityHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <PostsList />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Desktop Only, seamless background */}
        <div className="hidden lg:block h-full bg-background border-l border-border/30 overflow-y-auto">
          <RightSidebar className="h-full" />
        </div>
      </div>
    </div>
  );
};
