
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Home,
  File,
  Settings,
  User,
  FileEdit,
  Shield,
  LogOut,
  Search,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Início',
      icon: <Home className="w-[1.15em] h-[1.15em]" />,
      path: '/homepage',
      active: isActive('/homepage')
    },
    {
      name: 'Procurar',
      icon: <Search className="w-[1.15em] h-[1.15em]" />,
      path: '/search',
      active: isActive('/search')
    },
    {
      name: 'Editar',
      icon: <FileEdit className="w-[1.15em] h-[1.15em]" />,
      path: '/edit',
      active: isActive('/edit'),
      showToAdmin: true
    },
    {
      name: 'Administração',
      icon: <Shield className="w-[1.15em] h-[1.15em]" />,
      path: '/admin',
      active: isActive('/admin'),
      adminOnly: true
    },
    {
      name: 'Perfil',
      icon: <User className="w-[1.15em] h-[1.15em]" />,
      path: '/profile',
      active: isActive('/profile')
    },
    {
      name: 'Configurações',
      icon: <Settings className="w-[1.15em] h-[1.15em]" />,
      path: '/settings',
      active: isActive('/settings')
    }
  ];

  return (
    <div className="fixed top-0 left-0 h-full z-40 bg-[#121212] border-r border-white/10">
      <div className="flex flex-col h-full">
        <div className="px-4 py-6">
          <Link to="/homepage">
            {isCollapsed ? (
              <Logo dark={false} collapsed={true} />
            ) : (
              <Logo dark={false} />
            )}
          </Link>
        </div>
        <div className="flex-grow p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.adminOnly && !isAdmin) {
                return null;
              }
              if (item.showToAdmin && !isAdmin) {
                return null;
              }
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-[1.1rem] font-medium rounded-md hover:bg-gray-800 ${
                      item.active ? 'bg-gray-800 text-white' : 'text-gray-400'
                    }`}
                  >
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800 text-[1.1rem]" 
              onClick={() => signOut()}
            >
              <LogOut className="w-[1.15em] h-[1.15em]" />
              {!isCollapsed && <span>Sair</span>}
            </Button>
            
            <Button
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-800 mt-2 text-[1.1rem]"
              onClick={toggleSidebar}
            >
              {!isCollapsed ? (
                <>
                  <span>Esconder</span>
                  <ChevronLeft className="w-[1.15em] h-[1.15em]" />
                </>
              ) : (
                <ChevronRight className="w-[1.15em] h-[1.15em] mx-auto" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
