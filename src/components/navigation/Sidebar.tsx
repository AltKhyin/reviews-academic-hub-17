
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight, FileEdit, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Logo from '../common/Logo';
import { useSidebar, Sidebar as SidebarComponent, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { profile, isAdmin, isEditor, isLoading, refreshProfile } = useAuth();
  const isCollapsed = state === 'collapsed';

  // Add an effect to refresh profile when sidebar mounts
  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: 'Erro ao realizar logout',
        description: 'Por favor tente novamente',
        variant: 'destructive',
      });
    }
  };

  // For debugging purposes
  console.log("Sidebar - Current user role:", profile?.role);
  console.log("Sidebar - Is admin:", isAdmin);
  console.log("Sidebar - Is editor:", isEditor);

  // Build navigation items based on role
  const navItems = [
    { icon: Home, label: 'Homepage', path: '/homepage' },
    { icon: BookOpen, label: 'Artigos', path: '/articles' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];
  
  // Add editor link if user is editor or admin
  if (isEditor) {
    navItems.push({ icon: FileEdit, label: 'Editor', path: '/edit-app' });
  }
  
  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin' });
  }
  
  // Add settings link for everyone
  navItems.push({ icon: Settings, label: 'Configurações', path: '/settings' });

  // Log the nav items for debugging
  console.log("Navigation items:", navItems.map(item => item.label));

  return (
    <SidebarComponent variant="sidebar" collapsible="icon">
      <div className="h-full flex flex-col">
        <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Logo dark collapsed={isCollapsed} size={isCollapsed ? 'small' : 'medium'} />
        </div>

        <SidebarContent className="px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 px-3 rounded-md mb-1 transition-colors group text-sm
                ${location.pathname === item.path ? 'bg-white/10' : 'hover:bg-white/5'}
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-light">{item.label}</span>
              )}
            </Link>
          ))}
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-white/10 p-2">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-2 px-3 rounded-md hover:bg-white/5 transition-colors mb-2 text-sm
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 font-light">Sair</span>}
          </button>
          
          <button
            onClick={toggleSidebar}
            className={`flex items-center w-full py-2 px-3 rounded-md hover:bg-white/5 transition-colors text-sm
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-3 font-light">Recolher</span>
              </>
            )}
          </button>
        </SidebarFooter>
      </div>
    </SidebarComponent>
  );
};

export default Sidebar;
