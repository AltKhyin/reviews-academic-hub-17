
// ABOUTME: Fixed navigation routing from /dashboard to /homepage
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const DashboardLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Fix: Redirect /dashboard to /homepage
  if (location.pathname === '/dashboard') {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#121212] flex">
        <Sidebar />
        <main className="flex-1 ml-64 transition-all duration-300">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};
