
// ABOUTME: Simplified community page without complex centralized data management
// Uses standard React Query patterns with individual focused hooks
import React from 'react';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { PostsList } from '@/components/community/PostsList';

const Community: React.FC = () => {
  console.log('Community: Initializing with simple data loading');
  
  return (
    <DataErrorBoundary context="community page" onRetry={() => window.location.reload()}>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <DataErrorBoundary context="community header">
            <CommunityHeader />
          </DataErrorBoundary>
          
          <DataErrorBoundary context="community posts">
            <PostsList />
          </DataErrorBoundary>
        </div>
      </div>
    </DataErrorBoundary>
  );
};

export default Community;
