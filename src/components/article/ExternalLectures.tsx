
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
      const { data, error } = await supabase
        .from('external_lectures')
        .select('*')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: false }) as { data: ExternalLecture[] | null; error: any };
        
      if (error) throw error;
      return (data || []) as ExternalLecture[];
    },
  });

  if (!lectures?.length) return null;

  return (
    <Card className="p-6 mb-8 border-white/10 bg-white/5">
      <h3 className="text-lg font-medium mb-4">Recommended External Lectures</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lectures.map((lecture) => (
          <a
            key={lecture.id}
            href={lecture.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer group"
          >
            <div className="aspect-video mb-2 overflow-hidden rounded-lg">
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
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {lecture.title}
            </h4>
            {lecture.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lecture.description}</p>
            )}
          </a>
        ))}
      </div>
    </Card>
  );
};
