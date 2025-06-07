
// Hook for managing tag configuration in the admin panel
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TagHierarchy, TagConfiguration } from '@/types/archive';

export const useTagConfiguration = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all tag configurations
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['tag-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tag_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TagConfiguration[];
    }
  });

  // Get active configuration
  const activeConfig = configurations.find(config => config.is_active) || null;

  // Create new configuration mutation
  const createConfiguration = useMutation({
    mutationFn: async (tagData: TagHierarchy) => {
      // First, deactivate all existing configurations
      const { error: deactivateError } = await supabase
        .from('tag_configurations')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) throw deactivateError;

      // Create new active configuration
      const { data, error } = await supabase
        .from('tag_configurations')
        .insert({
          tag_data: tagData,
          is_active: true,
          version: (activeConfig?.version || 0) + 1
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['active-tag-config'] });
      setIsEditing(false);
    }
  });

  // Validate JSON structure
  const validateTagData = (jsonString: string): { valid: boolean; data?: TagHierarchy; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'Root deve ser um objeto' };
      }

      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key !== 'string') {
          return { valid: false, error: 'Chaves devem ser strings' };
        }
        if (!Array.isArray(value)) {
          return { valid: false, error: `Valor para "${key}" deve ser um array` };
        }
        for (const item of value) {
          if (typeof item !== 'string') {
            return { valid: false, error: `Itens em "${key}" devem ser strings` };
          }
        }
      }

      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, error: 'JSON inválido' };
    }
  };

  // Get tag statistics
  const getTagStatistics = async (tagData: TagHierarchy) => {
    const stats = {
      totalCategories: Object.keys(tagData).length,
      totalSubtags: Object.values(tagData).flat().length,
      emptyCategories: Object.entries(tagData).filter(([, subtags]) => subtags.length === 0).length,
      mostPopulatedCategory: '',
      maxSubtags: 0
    };

    Object.entries(tagData).forEach(([category, subtags]) => {
      if (subtags.length > stats.maxSubtags) {
        stats.maxSubtags = subtags.length;
        stats.mostPopulatedCategory = category;
      }
    });

    return stats;
  };

  return {
    configurations,
    activeConfig,
    isLoading,
    isEditing,
    setIsEditing,
    createConfiguration,
    validateTagData,
    getTagStatistics
  };
};
