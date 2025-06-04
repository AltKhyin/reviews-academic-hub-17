
// ABOUTME: Dynamic sidebar section renderer with configuration support
// Bridges configuration and actual rendering with proper section mapping

import React from 'react';
import { SidebarSection, SidebarComponentMapping } from '@/types/sidebar';
import { useSidebarData } from '@/hooks/useSidebarData';

// Import all sidebar components
import { CommunityHeader } from './components/CommunityHeader';
import { ActiveAvatars } from './components/ActiveAvatars';
import { CommentCarousel } from './components/CommentCarousel';
import { TopThreads } from './components/TopThreads';
import { NextReviewCountdown } from './components/NextReviewCountdown';
import { WeeklyPoll } from './components/WeeklyPoll';
import { ResourceBookmarks } from './components/ResourceBookmarks';
import { RulesAccordion } from './components/RulesAccordion';
import { MiniChangelog } from './components/MiniChangelog';

// Unified component mapping
const SECTION_COMPONENTS: SidebarComponentMapping = {
  'header': CommunityHeader,
  'users': ActiveAvatars,
  'comments': CommentCarousel,
  'threads': TopThreads,
  'poll': WeeklyPoll,
  'countdown': NextReviewCountdown,
  'bookmarks': ResourceBookmarks,
  'rules': RulesAccordion,
  'changelog': MiniChangelog,
};

interface SidebarSectionRendererProps {
  section: SidebarSection;
  isLast?: boolean;
}

export const SidebarSectionRenderer: React.FC<SidebarSectionRendererProps> = ({ 
  section, 
  isLast = false 
}) => {
  const { getSectionConfig } = useSidebarData();
  const Component = SECTION_COMPONENTS[section.id];
  
  if (!Component || !section.enabled) {
    return null;
  }

  const sectionConfig = getSectionConfig(section.id);

  return (
    <React.Fragment>
      {/* Section Content with Configuration */}
      <div className="py-4 px-5">
        <Component config={sectionConfig} />
      </div>
      
      {/* Module Divider - subtle and clean hierarchy separator */}
      {!isLast && (
        <div className="border-t border-muted/30 mx-4"></div>
      )}
    </React.Fragment>
  );
};
