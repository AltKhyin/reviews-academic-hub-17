
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

// Content wrapper component that adjusts based on sidebar state
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  return (
    <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'}`}>
      <div className="mx-auto px-4 md:px-6 py-4 h-full flex justify-center">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Dashboard layout auth check:", data.session?.user?.email || "No session");
        
        if (!data.session) {
          console.log("No session found, redirecting to /auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate('/auth');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in layout:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
        <Sidebar />
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
