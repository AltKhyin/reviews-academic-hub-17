
// ABOUTME: Optimized Dashboard with integrated section visibility management - no UI changes
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { useOptimizedIssues } from '@/hooks/useOptimizedIssues';
import { useOptimizedSidebarData } from '@/hooks/useOptimizedSidebarData';
import { useSectionVisibilityStore } from '@/stores/sectionVisibilityStore';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { HomepageLayoutEngine } from '@/components/homepage/HomepageLayoutEngine';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

const Dashboard = () => {
  // Initialize section visibility store with default state
  const { getSectionConfig } = useSectionVisibilityStore();
  
  // Use parallel data loader which returns the full state
  const parallelDataState = useParallelDataLoader();
  
  // Fetch optimized issues data
  const { data: issuesData, isLoading: isIssuesLoading } = useOptimizedIssues({ 
    limit: 20,
    featuredOnly: false,
  });

  // Fetch optimized sidebar data for community stats
  const sidebarData = useOptimizedSidebarData();

  // Combine all loading states
  const isLoading = parallelDataState.isLoading || isIssuesLoading || sidebarData.isLoading;

  // Get section visibility configuration
  const sectionsConfig = getSectionConfig();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <DashboardHeader />
        
        <HomepageLayoutEngine 
          isLoading={isLoading}
          parallelData={parallelDataState}
          issuesData={issuesData || []}
          sidebarData={sidebarData}
          sectionsConfig={sectionsConfig}
        />
        
        {/* Performance monitoring in development */}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </div>
    </div>
  );
};

export default Dashboard;
