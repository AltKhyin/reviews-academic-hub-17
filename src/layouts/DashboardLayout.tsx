
// ABOUTME: Main dashboard layout with conditional sidebar rendering
// Excludes sidebar on community routes to prevent duplicate rendering

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';
import { RightSidebar } from '@/components/sidebar/RightSidebar';

export const DashboardLayout = () => {
  const location = useLocation();
  
  // Don't show the old right sidebar on community routes since it has its own integrated sidebar
  const shouldShowRightSidebar = !location.pathname.startsWith('/community');

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
        
        {/* Content with conditional right sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          
          {/* Conditional Right Sidebar - only show outside community */}
          {shouldShowRightSidebar && (
            <aside className="hidden xl:block w-80 border-l bg-card overflow-hidden">
              <RightSidebar isMobile={false} />
            </aside>
          )}
        </div>
      </div>
      
      {/* Mobile Right Sidebar Drawer - only show outside community */}
      {shouldShowRightSidebar && <RightSidebar isMobile={true} />}
    </div>
  );
};
