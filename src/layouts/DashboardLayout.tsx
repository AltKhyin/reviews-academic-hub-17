
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import { supabase } from '@/integrations/supabase/client';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(savedState === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
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
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
