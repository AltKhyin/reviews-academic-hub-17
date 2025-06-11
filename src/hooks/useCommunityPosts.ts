
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunitySettings } from '@/types/community';
import { usePosts } from '@/hooks/community/usePosts';
import { enhancePostsWithDetails } from '@/hooks/community/usePostEnhancement';

export function useCommunityPosts(activeTab: string, searchTerm: string) {
  const { data: posts, ...queryProps } = usePosts(activeTab, searchTerm);
  
  return useQuery({
    queryKey: ['enhanced-posts', posts],
    queryFn: async () => {
      if (!posts) return [];
      return enhancePostsWithDetails(posts);
    },
    enabled: !!posts,
    ...queryProps
  });
}

export function usePostFlairs() {
  return useQuery({
    queryKey: ['flairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_flairs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

export function useCommunitySettings() {
  return useQuery<CommunitySettings>({
    queryKey: ['community-settings'],
    queryFn: async () => {
      try {
        const response = await fetch(
          'https://kznasfgubbyinomtetiu.supabase.co/rest/v1/community_settings?select=*&limit=1',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bmFzZmd1YmJ5aW5vbXRldGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg4NzMsImV4cCI6MjA2MTI0NDg3M30.Fx7xl_EA_G8SVVjWyVRu61kWhwkrbFlZsulQz_WKx7Q',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch community settings: ${response.statusText}`);
        }
        
        const settings = await response.json();
        
        if (!settings || settings.length === 0) {
          const defaultSettings: Omit<CommunitySettings, 'id' | 'created_at' | 'updated_at'> = {
            header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
            theme_color: '#1e40af',
            description: 'Comunidade científica para discussão de evidências médicas',
            allow_polls: true
          };
          
          const insertResponse = await fetch(
            'https://kznasfgubbyinomtetiu.supabase.co/rest/v1/community_settings',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bmFzZmd1YmJ5aW5vbXRldGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg4NzMsImV4cCI6MjA2MTI0NDg3M30.Fx7xl_EA_G8SVVjWyVRu61kWhwkrbFlZsulQz_WKx7Q',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
              },
              body: JSON.stringify(defaultSettings)
            }
          );
          
          if (!insertResponse.ok) {
            throw new Error(`Failed to create default community settings: ${insertResponse.statusText}`);
          }
          
          const newSettings = await insertResponse.json();
          return newSettings as CommunitySettings;
        }
        
        return settings[0] as CommunitySettings;
      } catch (error) {
        console.error("Error fetching community settings:", error);
        
        return {
          id: 'default',
          header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
          theme_color: '#1e40af',
          description: 'Comunidade científica para discussão de evidências médicas',
          allow_polls: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
  });
}
