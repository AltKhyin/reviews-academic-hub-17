
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight, FileEdit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Logo from '../common/Logo';
import { useSidebar, Sidebar as SidebarComponent, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

const Sidebar = () => {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const [isAdmin, setIsAdmin] = useState(false);
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .single();
      setIsAdmin(!!adminData);
    };
    checkAdminStatus();
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

  const navItems = [
    { icon: Home, label: 'Homepage', path: '/homepage' },
    { icon: BookOpen, label: 'Artigos', path: '/articles' },
    { icon: User, label: 'Perfil', path: '/profile' },
    ...(isAdmin ? [{ icon: FileEdit, label: 'Editor', path: '/edit' }] : []),
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <SidebarComponent variant="sidebar" collapsible="icon">
      <div className="h-full flex flex-col">
        {/* Logo section */}
        <div className="p-4 flex justify-center">
          <Logo dark collapsed={isCollapsed} size={isCollapsed ? 'small' : 'medium'} />
        </div>

        {/* Navigation */}
        <SidebarContent className="px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 px-3 rounded-md mb-1 transition-colors group text-sm
                ${location.pathname === item.path ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-light">{item.label}</span>
              )}
            </Link>
          ))}
        </SidebarContent>

        {/* Footer section */}
        <SidebarFooter className="mt-auto border-t border-white/10 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-3 rounded-md hover:bg-white/5 transition-colors mb-2 text-sm"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 font-light">Sair</span>}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full py-2 px-3 rounded-md hover:bg-white/5 transition-colors text-sm"
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
