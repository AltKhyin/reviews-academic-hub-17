
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Define the CommentReport type to match the database structure
interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  entity_id: string;
  entity_type: string;
  comment?: {
    content: string;
    user_id: string;
    created_at: string;
    profiles?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  reporter?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const CommentReportsPanel: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
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
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      return commentId;
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-400/30">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">Rejeitado</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gerenciamento de Denúncias</h2>
        
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'pending' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </Button>
          <Button 
            variant={filter === 'approved' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Aprovadas
          </Button>
          <Button 
            variant={filter === 'rejected' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Rejeitadas
          </Button>
          <Button 
            variant={filter === 'all' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Carregando denúncias...</div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Flag className="h-5 w-5 text-red-400" />
                    <CardTitle className="text-lg">Comentário Denunciado</CardTitle>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(report.created_at), { 
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reported Comment Display */}
                {report.comment && (
                  <div className="bg-gray-800/30 p-4 rounded-md">
                    <div className="flex items-center mb-3 gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {report.comment.profiles?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{report.comment.profiles?.full_name || 'Usuário'}</div>
                        <div className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(report.comment.created_at), { 
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{report.comment.content}</p>
                  </div>
                )}
                
                {/* Reporter Info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Denunciado por:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={report.reporter?.avatar_url || undefined} />
                        <AvatarFallback>
                          {report.reporter?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.reporter?.full_name || 'Usuário anônimo'}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons - only show for pending reports */}
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
                        onClick={() => rejectReport.mutate(report.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Apropriado
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este comentário? Esta ação é irreversível e marcará a denúncia como aprovada.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (report.comment_id) {
                                  deleteComment.mutate(report.comment_id);
                                  approveReport.mutate(report.id);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir comentário
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Flag className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-400">Nenhuma denúncia {filter !== 'all' ? filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovada' : 'rejeitada' : ''} encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
