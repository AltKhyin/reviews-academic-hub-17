
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { IssueFormContainer } from './components/issue/IssueFormContainer';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const IssueCreator = () => {
  const navigate = useNavigate();

  const defaultValues: IssueFormValues = {
    title: '',
    description: '',
    tags: '',
    pdf_url: '',
    article_pdf_url: '',
    cover_image_url: '',
    published: false,
    featured: false,
    authors: '',
    search_title: '',
    real_title: '',
    real_title_ptbr: '',
    search_description: '',
    year: '',
    design: '',
    score: 0,
    population: ''
  };

  const handleSubmit = async (values: IssueFormValues) => {
    try {
      // Convert tags from [tag:name] format to comma-separated string
      const specialtyTags = values.tags
        .match(/\[tag:([^\]]+)\]/g)
        ?.map(tag => tag.replace(/\[tag:([^\]]+)\]/, '$1'))
        .join(', ') || '';

      const insertData = {
        title: values.title,
        description: values.description,
        specialty: specialtyTags,
        pdf_url: values.pdf_url,
        article_pdf_url: values.article_pdf_url,
        cover_image_url: values.cover_image_url,
        published: values.published,
        featured: values.featured,
        authors: values.authors,
        search_title: values.search_title,
        real_title: values.real_title,
        real_title_ptbr: values.real_title_ptbr,
        search_description: values.search_description,
        year: values.year,
        design: values.design,
        score: values.score,
        population: values.population,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('issues')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Edição criada com sucesso!",
        description: "A nova edição foi criada e pode ser editada.",
      });

      navigate(`/issues/${data.id}/edit`);
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Erro ao criar edição",
        description: error.message || "Não foi possível criar a edição. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/edit')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Nova Edição</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes para criar uma nova edição
          </p>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Detalhes da Nova Edição</CardTitle>
          <CardDescription>
            Configure todas as informações necessárias para a edição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IssueFormContainer 
            defaultValues={defaultValues}
            onSubmit={handleSubmit} 
            onCancel={() => navigate('/edit')} 
            isSubmitting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueCreator;
