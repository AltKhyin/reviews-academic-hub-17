
// ABOUTME: Main dashboard layout with authentication guard
// Redirects unauthenticated users to auth page

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <AuthGuard requireAuth={true} fallbackPath="/auth">
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
    </AuthGuard>
  );
};
