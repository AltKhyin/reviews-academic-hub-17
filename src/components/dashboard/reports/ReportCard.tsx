
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface CommentReport {
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

interface ReportCardProps {
  report: CommentReport;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string) => void;
  onDelete: (commentId: string, reportId: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  onApprove, 
  onReject, 
  onDelete,
  isDeleting,
  isUpdating
}) => {
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
    <Card key={report.id} className="border-white/10 bg-white/5">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-red-400" />
            <div className="text-lg font-medium">Comentário Denunciado</div>
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
                onClick={() => onReject(report.id)}
                disabled={isUpdating}
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
                    disabled={isDeleting}
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
                          onDelete(report.comment_id, report.id);
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
  );
};
