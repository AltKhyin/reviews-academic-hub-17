
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

// Content wrapper component that adjusts based on sidebar state
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  return (
    <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'}`}>
      <div className="mx-auto max-w-7xl p-4 md:p-6 h-full">
        {children}
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
