
// ABOUTME: Main dashboard layout with simplified structure
// Removes conditional sidebar mounting to prevent duplicates on community routes

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';

export const DashboardLayout = () => {
  const location = useLocation();

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
