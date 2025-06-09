
// ABOUTME: Dashboard header component with navigation and user controls
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Archive, Users, Search } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/archive')}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/community')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Community
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/search')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </header>
  );
};
