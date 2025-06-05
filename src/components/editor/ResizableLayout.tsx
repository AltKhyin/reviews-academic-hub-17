
// ABOUTME: Resizable layout component for horizontal editor/preview split
// Provides flexible workspace with persisted layout preferences

import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Layout, Eye, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  defaultLayout?: number[];
  onLayoutChange?: (layout: number[]) => void;
  minLeftSize?: number;
  minRightSize?: number;
  className?: string;
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftPanel,
  rightPanel,
  leftTitle = "Editor",
  rightTitle = "Preview",
  defaultLayout = [50, 50],
  onLayoutChange,
  minLeftSize = 30,
  minRightSize = 30,
  className = ""
}) => {
  const [layout, setLayout] = useState<number[]>(defaultLayout);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  
  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('editor-layout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        if (Array.isArray(parsedLayout) && parsedLayout.length === 2) {
          setLayout(parsedLayout);
        }
      } catch (error) {
        console.warn('Failed to parse saved layout:', error);
      }
    }
  }, []);

  // Save layout changes
  const handleLayoutChange = (newLayout: number[]) => {
    setLayout(newLayout);
    localStorage.setItem('editor-layout', JSON.stringify(newLayout));
    onLayoutChange?.(newLayout);
  };

  const toggleLeftPanel = () => {
    if (isLeftCollapsed) {
      setLayout([50, 50]);
      setIsLeftCollapsed(false);
    } else {
      setLayout([0, 100]);
      setIsLeftCollapsed(true);
    }
  };

  const toggleRightPanel = () => {
    if (isRightCollapsed) {
      setLayout([50, 50]);
      setIsRightCollapsed(false);
    } else {
      setLayout([100, 0]);
      setIsRightCollapsed(true);
    }
  };

  const resetLayout = () => {
    setLayout([50, 50]);
    setIsLeftCollapsed(false);
    setIsRightCollapsed(false);
    localStorage.removeItem('editor-layout');
  };

  return (
    <div className={cn("resizable-layout h-full flex flex-col", className)}>
      {/* Layout Controls */}
      <div 
        className="flex items-center justify-between p-2 border-b flex-shrink-0"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4" style={{ color: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Layout
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftPanel}
            className="h-8 w-8 p-0"
            title={isLeftCollapsed ? "Show Editor" : "Hide Editor"}
            style={{ color: '#9ca3af' }}
          >
            {isLeftCollapsed ? <Edit3 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            className="h-8 w-8 p-0"
            title="Reset Layout"
            style={{ color: '#9ca3af' }}
          >
            <Layout className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightPanel}
            className="h-8 w-8 p-0"
            title={isRightCollapsed ? "Show Preview" : "Hide Preview"}
            style={{ color: '#9ca3af' }}
          >
            {isRightCollapsed ? <Eye className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Resizable Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={handleLayoutChange}
          className="h-full"
        >
          {/* Left Panel - Editor */}
          <ResizablePanel
            defaultSize={layout[0]}
            minSize={isLeftCollapsed ? 0 : minLeftSize}
            maxSize={isRightCollapsed ? 100 : 100 - minRightSize}
            className={cn(
              "flex flex-col",
              isLeftCollapsed && "hidden"
            )}
          >
            <div 
              className="flex items-center justify-between p-3 border-b flex-shrink-0"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a'
              }}
            >
              <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                {leftTitle}
              </h3>
              <div 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                {Math.round(layout[0])}%
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {leftPanel}
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          {!isLeftCollapsed && !isRightCollapsed && (
            <ResizableHandle 
              withHandle
              className="w-1 hover:bg-blue-500 transition-colors"
              style={{ backgroundColor: '#2a2a2a' }}
            />
          )}

          {/* Right Panel - Preview */}
          <ResizablePanel
            defaultSize={layout[1]}
            minSize={isRightCollapsed ? 0 : minRightSize}
            maxSize={isLeftCollapsed ? 100 : 100 - minLeftSize}
            className={cn(
              "flex flex-col",
              isRightCollapsed && "hidden"
            )}
          >
            <div 
              className="flex items-center justify-between p-3 border-b flex-shrink-0"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a'
              }}
            >
              <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                {rightTitle}
              </h3>
              <div 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  backgroundColor: '#10b981',
                  color: '#ffffff'
                }}
              >
                {Math.round(layout[1])}%
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {rightPanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
