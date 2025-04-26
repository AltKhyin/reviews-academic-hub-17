
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Logo from '../common/Logo';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
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
      className={`bg-[#0d0d0d] border-r border-[#2a2a2a] transition-all duration-300 ease-in-out h-full flex-shrink-0 fixed top-0 left-0 z-20 h-screen
                 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-center px-4">
          {!collapsed ? <Logo dark /> : <Logo dark collapsed />}
        </div>
        
        <nav className="flex-1 px-2 py-4 overflow-hidden">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-2 py-3 text-sm hover-effect rounded-md whitespace-nowrap
                              ${isActive 
                                ? 'bg-[#2a2a2a] text-white' 
                                : 'text-gray-300 hover:bg-[#1a1a1a]'}`}
                  >
                    <item.icon size={20} strokeWidth={1.5} className="min-w-5" />
                    {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-2 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-3 text-sm text-gray-300 hover:bg-[#1a1a1a] hover-effect rounded-md whitespace-nowrap"
          >
            <LogOut size={20} strokeWidth={1.5} className="min-w-5" />
            {!collapsed && <span className="ml-3 truncate">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
