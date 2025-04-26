
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Logo from '../common/Logo';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/area-de-membros' },
    { icon: BookOpen, label: 'Artigos', path: '/articles' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você foi desconectado da sua conta',
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

  return (
    <aside 
      className={`bg-[#0d0d0d] h-screen flex flex-col fixed top-0 left-0 z-20 transition-all duration-300 ease-in-out border-r border-[#2a2a2a]
                 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="h-full flex flex-col">
        {/* Logo area with more space */}
        <div className={`${collapsed ? 'py-5' : 'py-6'} flex items-center justify-center border-b border-[#2a2a2a]`}>
          {!collapsed ? <Logo dark size="large" /> : <Logo dark collapsed size="medium" />}
        </div>
        
        <nav className="flex-1 px-2 py-6 overflow-hidden">
          <ul className="space-y-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-3 rounded-md whitespace-nowrap group
                              ${isActive 
                                ? 'bg-[#2a2a2a] text-white' 
                                : 'text-gray-300 hover:bg-[#1a1a1a]'}`}
                  >
                    <item.icon size={22} strokeWidth={1.5} className="min-w-5" />
                    {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Toggle sidebar button */}
        <button 
          onClick={toggleSidebar}
          className="mx-auto mb-4 p-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronRight 
            size={22} 
            strokeWidth={1.5} 
            className={`text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
        
        <div className="p-2 mt-auto border-t border-[#2a2a2a] py-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-[#1a1a1a] rounded-md whitespace-nowrap"
          >
            <LogOut size={22} strokeWidth={1.5} className="min-w-5" />
            {!collapsed && <span className="ml-3 font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
