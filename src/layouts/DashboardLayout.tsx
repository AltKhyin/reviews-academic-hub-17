
// ABOUTME: Main dashboard layout with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';
import { CSS_VARIABLES } from '@/utils/colorSystem';

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen" style={{ backgroundColor: CSS_VARIABLES.PRIMARY_BG }}>
      {/* Left Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - with left margin to account for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Mobile Header with Sidebar Toggle */}
        <div 
          className="lg:hidden flex items-center justify-between p-4 border-b"
          style={{ borderColor: CSS_VARIABLES.BORDER_DEFAULT }}
        >
          <MobileSidebarToggle />
        </div>
        
        {/* Main Content Container - simplified single column layout */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
