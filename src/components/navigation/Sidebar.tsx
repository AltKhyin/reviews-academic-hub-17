
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Search, Users, Settings, Edit, LogOut, ChevronDown 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '../common/Logo';
import { Button } from '@/components/ui/button';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = user?.user_metadata?.role === 'admin';
  
  return (
    <SidebarComponent className="h-screen">
      <SidebarHeader className="p-6 flex justify-center items-center">
        <Logo collapsed={false} dark size="medium" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/homepage" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <Home size={20} className="mr-2" />
                <span>Início</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/articles" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <BookOpen size={20} className="mr-2" />
                <span>Artigos</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/procurar" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <Search size={20} className="mr-2" />
                <span>Procurar</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/community" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <Users size={20} className="mr-2" />
                <span>Comunidade</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/edit" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                  <Edit size={20} className="mr-2" />
                  <span>Editar</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-primary' : ''}>
                <Settings size={20} className="mr-2" />
                <span>Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut size={20} className="mr-2" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
