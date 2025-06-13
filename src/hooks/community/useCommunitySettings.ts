
// ABOUTME: Simple hook to load community settings
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunitySettings {
  id: string;
  allow_polls: boolean;
  header_image_url?: string;
  theme_color: string;
  description?: string;
}

export const useCommunitySettings = () => {
  return useQuery({
    queryKey: ['community-settings'],
    queryFn: async () => {
      console.log('Loading community settings...');
      
      const { data, error } = await supabase
        .from('community_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading community settings:', error);
        throw error;
      }
      
      console.log('Community settings loaded');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - settings change rarely
  });
};
