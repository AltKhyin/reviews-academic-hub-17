
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="pt-6 pb-24 space-y-16 max-w-[96%] mx-auto px-8">
      {/* Featured Section Skeleton */}
      <div className="mb-16">
        <div className="mb-8">
          <Skeleton className="h-12 w-80 mb-3 bg-white/10" />
          <Skeleton className="h-1 w-32 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
        </div>
        <Skeleton className="h-96 md:h-[32rem] w-full rounded-3xl bg-white/5" />
      </div>

      {/* Articles Section Skeleton */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-16">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-3 bg-white/10" />
            <Skeleton className="h-1 w-24 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((card) => (
              <div key={card} className="h-72">
                <div className="bg-white/5 rounded-2xl p-6 h-full flex flex-col backdrop-blur-sm border border-white/10">
                  {/* Image skeleton */}
                  <Skeleton className="h-32 w-full rounded-xl mb-4 bg-white/10" />
                  
                  {/* Title skeleton */}
                  <Skeleton className="h-5 w-full mb-2 bg-white/10" />
                  <Skeleton className="h-5 w-3/4 mb-4 bg-white/10" />
                  
                  {/* Description skeleton */}
                  <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-white/10" />
                  
                  {/* Meta info skeleton */}
                  <div className="mt-auto flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
