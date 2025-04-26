
import React, { useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FormIssueValues } from '@/types/issue';
import { UseFormReturn } from 'react-hook-form';

interface IssueFormProps {
  form: UseFormReturn<FormIssueValues>;
  onSubmit: (values: FormIssueValues) => Promise<void>;
  onCancel: () => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({ form, onSubmit, onCancel }) => {
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingArticlePdf, setUploadingArticlePdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'review' | 'article') => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      if (fileType === 'review') {
        setUploadingPdf(true);
      } else {
        setUploadingArticlePdf(true);
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issues')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);
      
      if (fileType === 'review') {
        form.setValue('pdf_url', data.publicUrl);
      } else {
        form.setValue('article_pdf_url', data.publicUrl);
      }
      
      toast({
        title: "Arquivo enviado com sucesso",
        description: "O PDF foi carregado e associado a esta edição.",
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Erro ao enviar arquivo",
        description: "Ocorreu um erro ao carregar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      if (fileType === 'review') {
        setUploadingPdf(false);
      } else {
        setUploadingArticlePdf(false);
      }
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploadingCover(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issues')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);
      
      form.setValue('cover_image_url', data.publicUrl);
      
      toast({
        title: "Imagem enviada com sucesso",
        description: "A imagem de capa foi carregada e associada a esta edição.",
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Ocorreu um erro ao carregar a imagem de capa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título da edição" {...field} />
              </FormControl>
              <FormDescription>
                O título principal desta edição
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição curta sobre o conteúdo desta edição" 
                  {...field}
                  rows={4} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="[tag:hematologia][tag:medicina]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Use o formato [tag:nome] para cada tag
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="article_pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artigo Original PDF</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="URL do arquivo PDF original" {...field} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={() => document.getElementById('article_pdf_upload')?.click()}
                    disabled={uploadingArticlePdf}
                  >
                    {uploadingArticlePdf ? 'Enviando...' : (
                      <>
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </>
                    )}
                  </Button>
                  <input
                    id="article_pdf_upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handlePdfUpload(e, 'article')}
                  />
                </div>
              </FormControl>
              <FormDescription>
                PDF do artigo original para esta edição
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revisão PDF</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="URL do arquivo PDF da revisão" {...field} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={() => document.getElementById('review_pdf_upload')?.click()}
                    disabled={uploadingPdf}
                  >
                    {uploadingPdf ? 'Enviando...' : (
                      <>
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </>
                    )}
                  </Button>
                  <input
                    id="review_pdf_upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handlePdfUpload(e, 'review')}
                  />
                </div>
              </FormControl>
              <FormDescription>
                PDF da revisão desta edição
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="URL da imagem de capa" {...field} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={() => document.getElementById('cover_upload')?.click()}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? 'Enviando...' : (
                      <>
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </>
                    )}
                  </Button>
                  <input
                    id="cover_upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>
              </FormControl>
              <FormDescription>
                URL para a imagem de capa desta edição
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
};
