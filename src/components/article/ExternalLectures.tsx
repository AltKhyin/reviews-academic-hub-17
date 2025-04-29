
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLecture } from '@/types/issue';

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
    enabled: !!issueId
  });

  if (!lectures?.length) return null;

  // We'll only display one lecture (as per requirement)
  const lecture = lectures[0];

  return (
    <Card className="p-6 mb-8 border-white/10 bg-white/5">
      <h3 className="text-lg font-medium mb-4">Aprimore seus conhecimentos</h3>
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
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium group-hover:text-primary transition-colors">
              {lecture.title}
            </h4>
            {lecture.description && (
              <p className="text-sm text-gray-300 mt-2">{lecture.description}</p>
            )}
          </div>
        </a>
      </div>
    </Card>
  );
};
