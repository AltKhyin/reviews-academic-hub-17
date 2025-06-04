
// ABOUTME: Main dashboard layout with conditional sidebar rendering
// Completely removes sidebar DOM element on non-community routes to eliminate layout gaps

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { cn } from '@/lib/utils';

export const DashboardLayout = () => {
  const location = useLocation();
  
  // Route-based sidebar detection - only community routes get sidebar
  const isCommunity = location.pathname.startsWith('/community');

  return (
    <div className="flex h-screen bg-background">
      {/* Left Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - with left margin to account for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <MobileSidebarToggle />
        </div>
        
        {/* Dynamic Layout Container */}
        <main className="flex-1 overflow-auto">
          <div className={cn(
            "h-full",
            // Community: Grid layout with sidebar column
            isCommunity && "grid grid-cols-[1fr_320px] gap-6",
            // Non-community: Single column, full width
            !isCommunity && "flex flex-col"
          )}>
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
            
            {/* Conditional Right Sidebar - only mount on community routes */}
            {isCommunity && (
              <aside className="border-l bg-card overflow-hidden">
                <RightSidebar isMobile={false} />
              </aside>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Right Sidebar Drawer - only mount on community routes */}
      {isCommunity && <RightSidebar isMobile={true} />}
    </div>
  );
};
