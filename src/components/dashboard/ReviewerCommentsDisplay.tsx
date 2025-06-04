
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

export const ReviewerCommentsDisplay = () => {
  const { data: comments, isLoading, error } = useReviewerComments();

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Notas do Revisor
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-purple-500/10 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-gray-300 text-lg leading-relaxed">Carregando comentários...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Notas do Revisor
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="bg-gradient-to-br from-red-600/5 to-orange-600/5 border border-red-500/10 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-red-300 text-lg leading-relaxed">Erro ao carregar comentários do revisor.</p>
        </div>
      </section>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Notas do Revisor
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-purple-500/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <MessageCircle className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
          <p className="text-gray-300 text-lg leading-relaxed">
            Aguarde novas notas e insights da equipe de revisão.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Notas do Revisor
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div 
            key={comment.id} 
            className="bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-purple-500/10 rounded-2xl p-8 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12 ring-2 ring-purple-500/20">
                <AvatarImage src={comment.reviewer_avatar || undefined} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 font-semibold">
                  {comment.reviewer_name?.[0] || 'R'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-semibold text-lg text-purple-300 tracking-tight">
                    {comment.reviewer_name}
                  </h3>
                  <span className="text-sm text-gray-400 font-medium">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                
                <p className="text-gray-200 leading-relaxed text-lg">
                  {comment.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
