
// ABOUTME: Hook for managing upcoming release settings and date calculations
// Provides functionality for upcoming releases section

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      console.error('Failed to load upcoming releases:', error);
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

      if (!error && data?.value) {
        // Use type guard to safely convert the JSON data
        const parsedValue = data.value as unknown;
        if (isValidUpcomingReleaseSettings(parsedValue)) {
          setSettings(prev => ({ ...prev, ...parsedValue }));
        } else {
          console.warn('Invalid upcoming release settings format in database, using defaults');
        }
      }
    } catch (error) {
      console.error('Failed to load upcoming release settings:', error);
    }
  }, []);

  // Update settings in database
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
      console.log('useUpcomingReleaseSettings: Settings updated successfully');
    } catch (error) {
      console.error('Failed to update upcoming release settings:', error);
      throw error;
    }
  }, [settings]);

  // Get the next upcoming release
  const getNextReleaseDate = useCallback((): Date | null => {
    if (releases.length === 0) return null;
    
    const now = new Date();
    const nextRelease = releases.find(release => 
      new Date(release.release_date) > now
    );
    
    return nextRelease ? new Date(nextRelease.release_date) : null;
  }, [releases]);

  // Get days until next release
  const getDaysUntilNextRelease = useCallback((): number | null => {
    const nextDate = getNextReleaseDate();
    if (!nextDate) return null;
    
    const now = new Date();
    const diffTime = nextDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [getNextReleaseDate]);

  // Check if next release should be highlighted
  const shouldHighlightNextRelease = useCallback((): boolean => {
    const daysUntil = getDaysUntilNextRelease();
    return daysUntil !== null && daysUntil <= settings.highlightThreshold;
  }, [getDaysUntilNextRelease, settings.highlightThreshold]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadSettings(),
        loadReleases()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [loadSettings, loadReleases]);

  return {
    releases,
    settings,
    isLoading,
    getNextReleaseDate,
    getDaysUntilNextRelease,
    shouldHighlightNextRelease,
    loadReleases,
    updateSettings,
  };
};
