
// ABOUTME: Community page with optimized data loading and zero API cascade
// Uses centralized data management instead of individual component queries
import React from 'react';
import { CommunityDataProvider } from '@/contexts/CommunityDataContext';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { PostsList } from '@/components/community/PostsList';
import { ComponentAuditor } from '@/utils/componentAudit';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

const CommunityContent: React.FC = () => {
  // PERFORMANCE MONITORING: Track API calls and violations
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Audit this component
      ComponentAuditor.auditComponent('Community', false, false);
      
      // Log initial metrics
      const totalCalls = apiCallMonitor.getTotalCallsInLastMinute();
      console.log(`🏘️ Community: Loaded with ${totalCalls} API calls in last minute`);
      
      // Set up performance monitoring interval
      const monitoringInterval = setInterval(() => {
        const currentCalls = apiCallMonitor.getTotalCallsInLastMinute();
        if (currentCalls > 15) {
          console.warn(`🚨 Community: High API activity detected - ${currentCalls} calls`);
        }
      }, 10000);

      return () => clearInterval(monitoringInterval);
    }
  }, []);

  return (
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
  );
};

const Community: React.FC = () => {
  console.log('Community: Initializing with centralized data management');
  
  return (
    <DataErrorBoundary context="community page" onRetry={() => window.location.reload()}>
      <CommunityDataProvider>
        <CommunityContent />
      </CommunityDataProvider>
    </DataErrorBoundary>
  );
};

export default Community;
