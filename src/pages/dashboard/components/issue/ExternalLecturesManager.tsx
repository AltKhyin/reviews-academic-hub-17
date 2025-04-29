
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ExternalLecture } from '@/types/issue';
import { toast } from '@/hooks/use-toast';
import { ExternalLectureForm } from './ExternalLectureForm';
import { ExternalLectureList } from './ExternalLectureList';

interface ExternalLecturesManagerProps {
  issueId: string;
}

export const ExternalLecturesManager: React.FC<ExternalLecturesManagerProps> = ({ issueId }) => {
  const { data: lectures = [], refetch } = useQuery({
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
    enabled: !!issueId
  });
  
  const handleDeleteLecture = async (lectureId: string) => {
    try {
      const { error } = await supabase
        .from('external_lectures')
        .delete()
        .eq('id', lectureId) as { error: any };
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "External lecture deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete external lecture",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <Separator className="my-6" />
      <h2 className="text-lg font-semibold mb-4">External Lectures</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Add External Lecture</CardTitle>
        </CardHeader>
        <CardContent>
          <ExternalLectureForm 
            issueId={issueId} 
            onSuccess={refetch} 
          />
        </CardContent>
      </Card>
      
      {lectures.length > 0 && (
        <div className="mt-4">
          <ExternalLectureList 
            lectures={lectures} 
            onDelete={handleDeleteLecture} 
          />
        </div>
      )}
    </div>
  );
};
