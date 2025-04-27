
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Featured article skeleton */}
      <Skeleton className="w-full h-[500px] rounded-lg" />
      
      {/* Recent articles skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-40 h-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
        </div>
      </div>
    </div>
  );
};
