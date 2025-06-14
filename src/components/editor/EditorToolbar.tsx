
// ABOUTME: Editor toolbar with comprehensive controls and proper TypeScript interfaces
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Maximize, 
  Minimize, 
  Sidebar,
  Grid,
  List,
  Save
} from 'lucide-react';

export interface EditorToolbarProps {
  onTogglePreview: () => void;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  showPreview: boolean;
  isFullscreen: boolean;
  sidebarCollapsed: boolean;
  onLayoutToggle?: () => void;
  currentLayout?: 'list' | 'grid';
  onSave?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onTogglePreview,
  onToggleFullscreen,
  onToggleSidebar,
  showPreview,
  isFullscreen,
  sidebarCollapsed,
  onLayoutToggle,
  currentLayout = 'list',
  onSave
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-2">
        {/* Layout toggle */}
        {onLayoutToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLayoutToggle}
            className="flex items-center space-x-1"
          >
            {currentLayout === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            <span>{currentLayout === 'grid' ? 'List' : 'Grid'}</span>
          </Button>
        )}

        {/* Preview toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="flex items-center space-x-1"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
        </Button>

        {/* Sidebar toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSidebar}
          className="flex items-center space-x-1"
        >
          <Sidebar className="h-4 w-4" />
          <span>{sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Save button */}
        {onSave && (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            className="flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        )}

        {/* Fullscreen toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          className="flex items-center space-x-1"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </Button>
      </div>
    </div>
  );
};
