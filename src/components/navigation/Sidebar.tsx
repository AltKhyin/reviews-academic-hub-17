
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';
import {
  Home,
  Search,
  FileText,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      name: 'Início',
      icon: <Home size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/homepage',
      active: isActive('/homepage')
    },
    {
      name: 'Procurar',
      icon: <Search size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/search',
      active: isActive('/search')
    },
    {
      name: 'Comunidade',
      icon: <MessageSquare size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/community',
      active: isActive('/community')
    },
    {
      name: 'Editar',
      icon: <FileText size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/edit',
      active: isActive('/edit'),
      showToAdmin: true
    },
    {
      name: 'Perfil',
      icon: <User size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/profile',
      active: isActive('/profile')
    }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full z-40 bg-[#121212] border-r border-white/10 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-center items-center py-6">
          <Link to="/homepage" className="flex justify-center w-full">
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
              if (item.showToAdmin && !isAdmin) {
                return null;
              }
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 font-medium tracking-wide rounded-md hover:bg-gray-800 ${
                      item.active ? 'bg-gray-800 text-white' : 'text-gray-400'
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="ml-3 text-[0.95rem] tracking-[0.05em] font-medium">{item.name}</span>}
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
              className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800" 
              onClick={() => signOut()}
            >
              <LogOut size={24} strokeWidth={1.5} className="w-6 h-6" />
              {!isCollapsed && <span className="text-[0.95rem] tracking-[0.05em] font-medium">Sair</span>}
            </Button>
            
            <Button
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-800 mt-2"
              onClick={toggleSidebar}
            >
              {!isCollapsed ? (
                <>
                  <span className="text-[0.95rem] tracking-[0.05em] font-medium">Esconder</span>
                  <ChevronLeft size={24} strokeWidth={1.5} className="w-6 h-6" />
                </>
              ) : (
                <ChevronRight size={24} strokeWidth={1.5} className="w-6 h-6 mx-auto" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
