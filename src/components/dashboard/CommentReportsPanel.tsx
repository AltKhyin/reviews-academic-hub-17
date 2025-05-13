
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ReportFilterButtons, ReportFilterType } from './reports/ReportFilterButtons';
import { ReportCard, CommentReport } from './reports/ReportCard';
import { EmptyReportState } from './reports/EmptyReportState';

export const CommentReportsPanel: React.FC = () => {
  const [filter, setFilter] = useState<ReportFilterType>('pending');
  const queryClient = useQueryClient();
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ['comment-reports', filter],
    queryFn: async () => {
      let query = supabase
        .from('comment_reports' as any)
        .select(`
          *,
          comment:comment_id (
            content,
            user_id,
            created_at,
            profiles:user_id (
              full_name,
              avatar_url
            )
          ),
          reporter:reporter_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
        
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as CommentReport[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const approveReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('comment_reports' as any)
        .update({ status: 'approved' })
        .eq('id', reportId);
        
      if (error) throw error;
      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-reports'] });
      toast({
        title: "Denúncia aprovada",
        description: "O comentário foi marcado como inapropriado."
      });
    },
    onError: (error) => {
      console.error('Error approving report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a denúncia.",
        variant: "destructive"
      });
    }
  });
  
  const rejectReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('comment_reports' as any)
        .update({ status: 'rejected' })
        .eq('id', reportId);
        
      if (error) throw error;
      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-reports'] });
      toast({
        title: "Denúncia rejeitada",
        description: "O comentário foi considerado apropriado."
      });
    },
    onError: (error) => {
      console.error('Error rejecting report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a denúncia.",
        variant: "destructive"
      });
    }
  });
  
  const deleteComment = useMutation({
    mutationFn: async ({ commentId, reportId }: { commentId: string, reportId: string }) => {
      // First approve the report
      const { error: approveError } = await supabase
        .from('comment_reports' as any)
        .update({ status: 'approved' })
        .eq('id', reportId);
        
      if (approveError) throw approveError;
      
      // Then delete the comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      return { commentId, reportId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-reports'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido com sucesso."
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteComment = (commentId: string, reportId: string) => {
    deleteComment.mutate({ commentId, reportId });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gerenciamento de Denúncias</h2>
        <ReportFilterButtons currentFilter={filter} onFilterChange={setFilter} />
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Carregando denúncias...</div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report}
              onApprove={(id) => approveReport.mutate(id)}
              onReject={(id) => rejectReport.mutate(id)}
              onDelete={(commentId, reportId) => handleDeleteComment(commentId, reportId)}
              isDeleting={deleteComment.isPending}
              isUpdating={approveReport.isPending || rejectReport.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyReportState filter={filter} />
      )}
    </div>
  );
};
