
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExternalLecture {
  id: string;
  title: string;
  description?: string | null;
  external_url: string;
  thumbnail_url?: string | null;
}

interface ExternalLecturesProps {
  lectures?: ExternalLecture[];
}

export const ExternalLectures: React.FC<ExternalLecturesProps> = ({ lectures = [] }) => {
  if (lectures.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-[#2a2a2a] pt-6">
      <h3 className="text-xl font-serif mb-4">Aprimore seus conhecimentos</h3>
      <div className="space-y-4">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="flex gap-4 items-start">
            {lecture.thumbnail_url ? (
              <div className="w-24 h-16 flex-shrink-0">
                <img
                  src={lecture.thumbnail_url}
                  alt={lecture.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ) : (
              <div className="w-24 h-16 bg-[#212121] rounded-md flex-shrink-0 flex items-center justify-center">
                <span className="text-sm text-gray-400">No thumbnail</span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium text-white">{lecture.title}</h4>
              {lecture.description && (
                <p className="text-sm text-gray-400 mt-1">{lecture.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
