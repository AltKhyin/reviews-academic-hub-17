
// ABOUTME: External lectures component with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLecture } from '@/types/issue';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface ExternalLecturesProps {
  issueId: string;
}

export const ExternalLectures = ({ issueId }: ExternalLecturesProps) => {
  const { data: lectures } = useQuery({
    queryKey: ['external-lectures', issueId],
    queryFn: async () => {
      // We need to bypass TypeScript's type checking by using any here
      const { data, error } = await (supabase as any)
        .from('external_lectures')
        .select('*')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return (data || []) as ExternalLecture[];
    },
  });

  if (!lectures?.length) return null;

  // We'll only display one lecture (as per requirement)
  const lecture = lectures[0];

  return (
    <Card 
      className="p-6 mb-8 border"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
        Aprimore seus conhecimentos
      </h3>
      <div>
        <a
          href={lecture.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer group flex gap-4"
        >
          <div className="aspect-video w-1/3 overflow-hidden rounded-lg">
            {lecture.thumbnail_url ? (
              <img
                src={lecture.thumbnail_url}
                alt={lecture.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: CSS_VARIABLES.TERTIARY_BG }}
              >
                <span className="text-sm" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>No image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 
              className="text-lg font-medium group-hover:text-primary transition-colors"
              style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}
            >
              {lecture.title}
            </h4>
            {lecture.description && (
              <p className="text-sm mt-2" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
                {lecture.description}
              </p>
            )}
          </div>
        </a>
      </div>
    </Card>
  );
};
