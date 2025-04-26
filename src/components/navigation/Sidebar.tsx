
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Logo from '../common/Logo';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-[#121212] text-white transition-all duration-300 border-r border-white/10 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6">
        <Logo dark collapsed={isCollapsed} />
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-4 rounded-lg mb-1 transition-colors
              ${location.pathname === item.path ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <item.icon className="w-7 h-7 flex-shrink-0" />
            {!isCollapsed && <span className="font-light tracking-wide">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-6 pt-2 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-4 w-full rounded-lg hover:bg-white/5 transition-colors mb-2"
        >
          <LogOut className="w-7 h-7" />
          {!isCollapsed && <span className="font-light tracking-wide">Sair</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-3 px-3 py-4 w-full rounded-lg hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-7 h-7" />
          ) : (
            <>
              <ChevronLeft className="w-7 h-7" />
              <span className="font-light tracking-wide">Recolher</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
