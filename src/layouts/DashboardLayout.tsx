
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileSidebarToggle } from '@/components/sidebar/MobileSidebarToggle';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const DashboardLayout = () => {
  return (
    <AuthGuard requireAuth={true} fallbackPath="/auth">
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-auto">
              <div className="md:hidden p-4">
                <MobileSidebarToggle />
              </div>
              <Outlet />
            </main>
            
            <RightSidebar />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};
