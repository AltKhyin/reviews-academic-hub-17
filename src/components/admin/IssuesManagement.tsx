
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Search,
  Calendar,
  FileText,
  Users
} from 'lucide-react';
import { Issue } from '@/types/issue';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const IssuesManagement = () => {
  const navigate = useNavigate();
  const { data: issues = [], isLoading, refetch } = useIssues();
  const { isAdmin, isEditor } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  if (!isAdmin && !isEditor) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-400">
              Você precisa de privilégios de administrador ou editor para gerenciar edições.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && issue.published) ||
                         (filterStatus === 'draft' && !issue.published) ||
                         (filterStatus === 'featured' && issue.featured);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (issue: Issue) => {
    if (issue.featured) {
      return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Star className="w-3 h-3 mr-1" />Destaque</Badge>;
    }
    if (issue.published) {
      return <Badge className="bg-green-600 hover:bg-green-700"><Eye className="w-3 h-3 mr-1" />Publicado</Badge>;
    }
    return <Badge variant="outline"><EyeOff className="w-3 h-3 mr-1" />Rascunho</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerenciar Edições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerenciar Edições ({issues.length})
          </CardTitle>
          <Button onClick={() => navigate('/issues/create')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Edição
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por título, descrição ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'featured'] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterStatus === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filter)}
              >
                {filter === 'all' && 'Todas'}
                {filter === 'published' && 'Publicadas'}
                {filter === 'draft' && 'Rascunhos'}
                {filter === 'featured' && 'Destaque'}
              </Button>
            ))}
          </div>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'Nenhuma edição encontrada' 
                : 'Nenhuma edição criada ainda'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os filtros ou termo de busca.'
                : 'Comece criando sua primeira edição.'}
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Button onClick={() => navigate('/issues/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Edição
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-white/10 hover:bg-secondary/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg truncate">{issue.title}</h3>
                    {getStatusBadge(issue)}
                  </div>
                  
                  {issue.description && (
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {issue.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {issue.specialty}
                    </span>
                    {issue.score !== null && issue.score > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {issue.score} pontos
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/issues/${issue.id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {issue.published && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
