
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Edit = () => {
  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Painel do Editor</h1>
        <Button asChild>
          <Link to="/edit/issue/new">Nova Edição</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Carregando edições...</p>
        ) : (
          issues?.map((issue) => (
            <Card key={issue.id} className="hover:bg-accent/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{issue.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    issue.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {issue.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </CardTitle>
                <CardDescription>{issue.description || 'Sem descrição'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/edit/issue/${issue.id}`}>
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Edit;
