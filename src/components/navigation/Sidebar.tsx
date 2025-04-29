import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';
import {
  Home,
  File,
  Settings,
  User,
  FileEdit,
  Shield,
  LogOut,
  Newspaper,
  Search
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Início',
      icon: <Home className="w-5 h-5" />,
      path: '/homepage',
      active: isActive('/homepage')
    },
    {
      name: 'Artigos',
      icon: <Newspaper className="w-5 h-5" />,
      path: '/articles',
      active: isActive('/articles')
    },
    {
      name: 'Busca Avançada',
      icon: <Search className="w-5 h-5" />,
      path: '/search',
      active: isActive('/search')
    },
    {
      name: 'Editar',
      icon: <FileEdit className="w-5 h-5" />,
      path: '/edit',
      active: isActive('/edit'),
      showToAdmin: true
    },
    {
      name: 'Administração',
      icon: <Shield className="w-5 h-5" />,
      path: '/admin',
      active: isActive('/admin'),
      adminOnly: true
    },
    {
      name: 'Perfil',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
      active: isActive('/profile')
    },
    {
      name: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
      active: isActive('/settings')
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Link to="/homepage">
          <Logo />
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
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 ${
                    item.active ? 'bg-gray-800 text-white' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-white/10">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
