// ABOUTME: Enhanced shared data provider with homepage fallback
// Provides centralized data management with proper error handling

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SharedDataContextType {
  sectionVisibility: Record<string, boolean>;
  setSectionVisibility: (visibility: Record<string, boolean>) => void;
  isLoading: boolean;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
};

export const SharedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    // Default sections - always visible to prevent empty homepage
    hero: true,
    featured: true,
    categories: true,
    recent: true,
    stats: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSectionVisibility = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .like('setting_key', 'section_visibility_%');

        if (error) throw error;

        if (data && data.length > 0) {
          const visibility: Record<string, boolean> = {
            // Keep defaults
            hero: true,
            featured: true,
            categories: true,
            recent: true,
            stats: true
          };
          
          data.forEach(setting => {
            const sectionName = setting.setting_key.replace('section_visibility_', '');
            visibility[sectionName] = setting.setting_value === 'true';
          });
          
          setSectionVisibility(visibility);
        }
        // If no data, keep defaults (already set in state)
      } catch (error) {
        console.error('Error loading section visibility:', error);
        // Keep defaults on error
      } finally {
        setIsLoading(false);
      }
    };

    loadSectionVisibility();
  }, []);

  return (
    <SharedDataContext.Provider value={{
      sectionVisibility,
      setSectionVisibility,
      isLoading
    }}>
      {children}
    </SharedDataContext.Provider>
  );
};
