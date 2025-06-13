
// ABOUTME: Hook for managing upcoming release settings and date calculations
// Provides functionality for upcoming releases section

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

export interface UpcomingRelease {
  id: string;
  release_date: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface UpcomingReleaseSettings {
  enabled: boolean;
  showDaysUntil: boolean;
  maxItems: number;
  highlightThreshold: number; // days until release to highlight
}

// Type guard to check if an object is a valid UpcomingReleaseSettings
const isValidUpcomingReleaseSettings = (obj: any): obj is UpcomingReleaseSettings => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.showDaysUntil === 'boolean' &&
    typeof obj.maxItems === 'number' &&
    typeof obj.highlightThreshold === 'number';
};

export const useUpcomingReleaseSettings = () => {
  const [releases, setReleases] = useState<UpcomingRelease[]>([]);
  const [settings, setSettings] = useState<UpcomingReleaseSettings>({
    enabled: true,
    showDaysUntil: true,
    maxItems: 5,
    highlightThreshold: 7
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load upcoming releases from database
  const loadReleases = useCallback(async () => {
    try {
      console.log('useUpcomingReleaseSettings: Loading upcoming releases...');
      
      const { data, error } = await supabase
        .from('upcoming_releases')
        .select('*')
        .gte('release_date', new Date().toISOString())
        .order('release_date', { ascending: true })
        .limit(settings.maxItems);

      if (error) {
        console.error('Error loading upcoming releases:', error);
        // Don't throw error, just log it and return empty array
        setReleases([]);
        return;
      }

      const releasesData = (data || []).map(release => ({
        id: release.id,
        release_date: release.release_date,
        title: release.title,
        description: release.description,
        created_at: release.created_at
      }));

      console.log('useUpcomingReleaseSettings: Loaded', releasesData.length, 'upcoming releases');
      setReleases(releasesData);
    } catch (error) {
      console.error('useUpcomingReleaseSettings: Error in loadReleases:', error);
      setReleases([]);
    }
  }, [settings.maxItems]);

  // Load settings from site_meta
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'upcoming_release_settings')
        .maybeSingle();

      if (error) {
        console.error('Error loading upcoming release settings:', error);
        return;
      }

      if (data?.value && isValidUpcomingReleaseSettings(data.value)) {
        setSettings(data.value);
        console.log('useUpcomingReleaseSettings: Loaded settings:', data.value);
      }
    } catch (error) {
      console.error('useUpcomingReleaseSettings: Error in loadSettings:', error);
    }
  }, []);

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await Promise.all([loadSettings(), loadReleases()]);
      setIsLoading(false);
    };

    initializeData();
  }, [loadSettings, loadReleases]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UpcomingReleaseSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'upcoming_release_settings',
          value: updatedSettings
        });

      if (error) {
        throw error;
      }

      setSettings(updatedSettings);
      console.log('useUpcomingReleaseSettings: Updated settings:', updatedSettings);
      
      // Reload releases if maxItems changed
      if (newSettings.maxItems && newSettings.maxItems !== settings.maxItems) {
        await loadReleases();
      }
    } catch (error) {
      console.error('useUpcomingReleaseSettings: Error updating settings:', error);
      throw error;
    }
  }, [settings, loadReleases]);

  // Calculate next release date (defaults to next Saturday at 9am)
  const getNextReleaseDate = useCallback((): Date => {
    if (releases.length > 0) {
      return new Date(releases[0].release_date);
    }

    // Default to next Saturday at 9am BRT
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = day === 6 ? 7 : 6 - day;
    let nextSaturday = addDays(now, daysUntilSaturday);
    nextSaturday.setHours(9, 0, 0, 0);
    
    // If it's Saturday after 9am, get next week's Saturday
    if (day === 6 && now.getHours() >= 9) {
      nextSaturday = addDays(nextSaturday, 7);
    }
    
    return nextSaturday;
  }, [releases]);

  return {
    releases,
    settings,
    isLoading,
    updateSettings,
    getNextReleaseDate,
    refetch: loadReleases
  };
};
