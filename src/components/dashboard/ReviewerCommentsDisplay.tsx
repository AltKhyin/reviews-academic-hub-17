
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

export const ReviewerCommentsDisplay = () => {
  const { comments, isLoading, hasComments } = useReviewerComments();

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="mb-10">
          <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
            Notas do Revisor
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
        </div>
        <div className="relative bg-gradient-to-br from-purple-600/8 to-blue-600/8 border border-purple-500/15 rounded-3xl p-12 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-300 text-xl leading-relaxed text-center font-light">
              Carregando comentários do revisor...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!hasComments) {
    return (
      <section className="mb-20">
        <div className="mb-10">
          <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
            Notas do Revisor
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
        </div>
        <div className="relative bg-gradient-to-br from-purple-600/8 to-blue-600/8 border border-purple-500/15 rounded-3xl p-12 text-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full shadow-inner">
                <MessageCircle className="w-16 h-16 text-purple-400/70" />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium mb-4 text-gray-200">
              Aguardando Insights
            </h3>
            <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto font-light">
              Nossa equipe de revisão está preparando novas perspectivas e análises para enriquecer sua experiência de leitura.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
          Notas do Revisor
        </h2>
        <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
      </div>
      
      <div className="space-y-8">
        {comments.map((comment, index) => (
          <div 
            key={comment.id} 
            className="group relative bg-gradient-to-br from-purple-600/8 to-blue-600/8 border border-purple-500/15 rounded-3xl p-10 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 hover:scale-[1.02] hover:border-purple-500/25"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar className="w-16 h-16 ring-4 ring-purple-500/30 shadow-lg group-hover:ring-purple-400/50 transition-all duration-500">
                    <AvatarImage src={comment.reviewer_avatar || undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-200 font-bold text-lg border border-purple-400/20">
                      {comment.reviewer_name?.[0] || 'R'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-gray-900 shadow-lg"></div>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-2xl text-purple-200 tracking-tight group-hover:text-purple-100 transition-colors duration-300">
                      {comment.reviewer_name}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                      Revisor Editorial
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400 font-medium bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-full opacity-30"></div>
                  <blockquote className="pl-6 text-gray-200 leading-relaxed text-xl font-light italic group-hover:text-gray-100 transition-colors duration-300">
                    "{comment.comment}"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
