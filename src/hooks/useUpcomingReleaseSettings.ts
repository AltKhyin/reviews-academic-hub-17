
// ABOUTME: Upcoming release settings management hook
import { useState, useCallback } from 'react';
import { useOptimizedQuery, queryKeys } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ReleaseSettings {
  customDate?: string;
  customTime?: string;
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'biweekly';
  recurringDays?: string[];
  recurringTime?: string;
  wipeSuggestions?: boolean;
}

export const useUpcomingReleaseSettings = () => {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useOptimizedQuery<ReleaseSettings>(
    ['upcoming-release-settings'],
    async (): Promise<ReleaseSettings> => {
      try {
        const { data, error } = await supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'upcoming_release_settings')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return data?.value || {
          customDate: '',
          customTime: '',
          isRecurring: false,
          recurringPattern: 'weekly',
          recurringDays: [],
          recurringTime: '10:00',
          wipeSuggestions: true,
        };
      } catch (error) {
        console.warn('Failed to fetch release settings:', error);
        return {
          customDate: '',
          customTime: '',
          isRecurring: false,
          recurringPattern: 'weekly',
          recurringDays: [],
          recurringTime: '10:00',
          wipeSuggestions: true,
        };
      }
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const updateSettings = useCallback(async (newSettings: ReleaseSettings) => {
    try {
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'upcoming_release_settings',
          value: newSettings,
        });
      
      if (error) throw error;
      
      // Update cache
      queryClient.setQueryData(['upcoming-release-settings'], newSettings);
    } catch (error) {
      console.error('Failed to update release settings:', error);
      throw error;
    }
  }, [queryClient]);

  const getNextReleaseDate = useCallback(() => {
    if (!settings) return null;
    
    if (settings.customDate) {
      return new Date(settings.customDate);
    }
    
    if (settings.isRecurring && settings.recurringDays?.length) {
      // Simple logic for next recurring date
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return nextWeek;
    }
    
    return null;
  }, [settings]);

  return {
    settings: settings || {
      customDate: '',
      customTime: '',
      isRecurring: false,
      recurringPattern: 'weekly' as const,
      recurringDays: [],
      recurringTime: '10:00',
      wipeSuggestions: true,
    },
    isLoading,
    updateSettings,
    getNextReleaseDate,
  };
};
