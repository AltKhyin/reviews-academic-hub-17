
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
    { icon: Home, label: 'Homepage', path: '/homepage' },
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
      className={`bg-[#0d0d0d] min-h-screen flex flex-col fixed top-0 left-0 z-20 transition-all duration-300 ease-in-out border-r border-[#2a2a2a]
                 ${collapsed ? 'w-20' : 'w-72'}`}
    >
      <div className="h-full flex flex-col">
        <div className={`${collapsed ? 'py-8' : 'py-8'} flex items-center justify-center border-b border-[#2a2a2a]`}>
          <Logo dark size={collapsed ? "large" : "large"} collapsed={collapsed} />
        </div>
        
        <nav className="flex-1 px-3 py-8">
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
                    <item.icon size={22} strokeWidth={1.5} className="min-w-6 flex-shrink-0" />
                    {!collapsed && <span className="ml-3 text-sm font-medium transition-opacity duration-200 opacity-100">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="mt-auto border-t border-[#2a2a2a] p-4 space-y-4">
          <button 
            onClick={toggleSidebar}
            className="w-full flex justify-center p-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronRight 
              size={22} 
              strokeWidth={1.5} 
              className={`text-gray-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
            />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-red-900/20 hover:text-red-400 rounded-md whitespace-nowrap transition-colors"
          >
            <LogOut size={22} strokeWidth={1.5} className="min-w-6 flex-shrink-0" />
            {!collapsed && <span className="ml-3 font-medium transition-opacity duration-200 opacity-100">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
