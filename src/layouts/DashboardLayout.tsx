
// ABOUTME: Main dashboard layout with simplified structure and responsive editor support
// Removes conditional sidebar mounting to prevent duplicates and handles editor expansion

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';

export const DashboardLayout = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.includes('/edit/issue');

  return (
    <div className="flex h-screen bg-background">
      {/* Left Navigation Sidebar - always present but conditionally styled */}
      <Sidebar />
      
      {/* Main Content Area - responsive margin based on page type */}
      <div className={`flex-1 flex flex-col overflow-hidden ${!isEditorPage ? 'ml-64' : ''}`}>
        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <MobileSidebarToggle />
        </div>
        
        {/* Main Content Container */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
