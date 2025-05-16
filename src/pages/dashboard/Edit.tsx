import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Issue, FormIssueValues } from '@/types/issue';
import { IssueForm } from './components/IssueForm';
import { IssueCard } from './components/IssueCard';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { CommentReportsPanel } from '@/components/dashboard/CommentReportsPanel';
import { issueFormSchema } from '@/schemas/issue-form-schema';

const Edit = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';
  const [activeTab, setActiveTab] = useState("issues");
  
  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Issue[];
    }
  });

  const form = useForm<FormIssueValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      pdf_url: '',
      article_pdf_url: '',
      cover_image_url: '',
      authors: '',
      search_title: '',
      real_title: '',
      real_title_ptbr: '',
      search_description: '',
      year: '',
      design: '',
      score: 0,
      population: ''
    }
  });

  const handleCancel = () => {
    form.reset();
    setIsCreating(false);
  };

  const onSubmit = async (values: FormIssueValues) => {
    try {
      setIsSubmitting(true);
      
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      const issueData = {
        title: values.title,
        description: values.description || '',
        specialty: extractedTags.join(', '),
        pdf_url: values.pdf_url || 'placeholder.pdf',
        article_pdf_url: values.article_pdf_url || '',
        cover_image_url: values.cover_image_url || null,
        // Include all fields in the submission
        authors: values.authors || null,
        search_title: values.search_title || null,
        real_title: values.real_title || null,
        real_title_ptbr: values.real_title_ptbr || null,
        search_description: values.search_description || null,
        year: values.year || null,
        design: values.design || null,
        score: values.score || 0,
        population: values.population || null
      };
      
      console.log('Submitting issue data:', issueData);
      
      const { data, error } = await supabase
        .from('issues')
        .insert(issueData)
        .select();
      
      if (error) {
        console.error('Error creating issue:', error);
        throw error;
      }
      
      console.log('Issue created successfully:', data);
      
      toast({
        title: "Edição criada com sucesso!",
        description: "A nova edição foi adicionada ao sistema.",
      });
      
      form.reset();
      setIsCreating(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Erro ao criar edição",
        description: error.message || "Ocorreu um erro ao salvar a edição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Painel do Editor</h1>
        {!isCreating && isEditorOrAdmin && activeTab === "issues" && (
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Edição
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="issues">Gerenciar Edições</TabsTrigger>
          <TabsTrigger value="comments">Notas do Revisor</TabsTrigger>
          <TabsTrigger value="sections">Gerenciar Seções</TabsTrigger>
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues">
          {isCreating ? (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>Nova Edição</CardTitle>
                <CardDescription>Crie uma nova edição para a revista</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueForm 
                  form={form}
                  onSubmit={onSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <p>Carregando edições...</p>
              ) : issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue} 
                    formatTags={(tags) => tags.split(', ').map(tag => `[tag:${tag}]`).join('')}
                  />
                ))
              ) : (
                <p>Nenhuma edição encontrada.</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments">
          <ReviewerCommentSection />
        </TabsContent>

        <TabsContent value="sections">
          <HomepageSectionsManager />
        </TabsContent>

        <TabsContent value="reports">
          <CommentReportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Edit;
