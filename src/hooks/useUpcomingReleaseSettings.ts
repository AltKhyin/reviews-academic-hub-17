
// ABOUTME: Hook for managing upcoming release scheduling and settings
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UpcomingReleaseSettings {
  id?: string;
  customDate?: string;
  customTime?: string;
  isRecurring: boolean;
  recurringPattern: 'weekly' | 'biweekly';
  recurringDays: string[];
  recurringTime: string;
  wipeSuggestions: boolean;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: UpcomingReleaseSettings = {
  isRecurring: true,
  recurringPattern: 'weekly',
  recurringDays: ['segunda', 'quinta'],
  recurringTime: '10:00',
  wipeSuggestions: true,
  timezone: 'America/Sao_Paulo'
};

const STORAGE_KEY = 'upcoming_release_settings';

export const useUpcomingReleaseSettings = () => {
  const queryClient = useQueryClient();

  // Fetch settings from site_meta table
  const { data: settings, isLoading } = useQuery({
    queryKey: ['upcomingReleaseSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'upcoming_release_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data?.value) {
        return DEFAULT_SETTINGS;
      }

      return { ...DEFAULT_SETTINGS, ...data.value } as UpcomingReleaseSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UpcomingReleaseSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { data, error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'upcoming_release_settings',
          value: updatedSettings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingReleaseSettings'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRelease'] });
    }
  });

  // Calculate next release date based on settings
  const getNextReleaseDate = useCallback((): Date | null => {
    if (!settings) return null;

    const now = new Date();
    const saoPauloNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

    if (!settings.isRecurring && settings.customDate && settings.customTime) {
      // Custom date/time
      const customDateTime = new Date(`${settings.customDate}T${settings.customTime}:00`);
      // Convert to São Paulo timezone
      return new Date(customDateTime.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    }

    if (settings.isRecurring && settings.recurringDays.length > 0) {
      // Recurring schedule
      const dayMap: { [key: string]: number } = {
        'domingo': 0,
        'segunda': 1,
        'terça': 2,
        'quarta': 3,
        'quinta': 4,
        'sexta': 5,
        'sábado': 6
      };

      const [hours, minutes] = settings.recurringTime.split(':').map(Number);
      const targetDays = settings.recurringDays.map(day => dayMap[day]).filter(day => day !== undefined);

      if (targetDays.length === 0) return null;

      // Find the next occurrence
      let nextDate = new Date(saoPauloNow);
      nextDate.setHours(hours, minutes, 0, 0);

      // If it's today but past the time, start from tomorrow
      if (nextDate <= saoPauloNow) {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      // Find the next matching day
      let attempts = 0;
      while (!targetDays.includes(nextDate.getDay()) && attempts < 7) {
        nextDate.setDate(nextDate.getDate() + 1);
        attempts++;
      }

      return nextDate;
    }

    return null;
  }, [settings]);

  const updateSettings = useCallback(async (newSettings: Partial<UpcomingReleaseSettings>) => {
    return updateSettingsMutation.mutateAsync(newSettings);
  }, [updateSettingsMutation]);

  return {
    settings,
    isLoading,
    updateSettings,
    getNextReleaseDate,
    isUpdating: updateSettingsMutation.isPending
  };
};
