
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash } from 'lucide-react';
import { ExternalLecture } from '@/types/issue';

interface ExternalLectureListProps {
  lectures: ExternalLecture[];
  onDelete: (id: string) => void;
}

export function ExternalLectureList({ lectures, onDelete }: ExternalLectureListProps) {
  if (!lectures.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Current External Lectures</h3>
      {lectures.map((lecture) => (
        <Card key={lecture.id} className="bg-secondary/20">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {lecture.thumbnail_url && (
                <img 
                  src={lecture.thumbnail_url} 
                  alt={lecture.title} 
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-medium">{lecture.title}</h4>
                {lecture.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{lecture.description}</p>
                )}
                <a href={lecture.external_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400">
                  {lecture.external_url}
                </a>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(lecture.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
