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
import { IssueFileUpload } from '@/components/issue/IssueFileUpload';

interface IssueFormProps {
  form: UseFormReturn<FormIssueValues>;
  onSubmit: (values: FormIssueValues) => Promise<void>;
  onCancel: () => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({ form, onSubmit, onCancel }) => {
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingArticlePdf, setUploadingArticlePdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

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
                  <IssueFileUpload
                    onUploadComplete={(url) => form.setValue('article_pdf_url', url)}
                    accept="application/pdf"
                    label="Upload"
                    folder="pdfs"
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
                  <IssueFileUpload
                    onUploadComplete={(url) => form.setValue('pdf_url', url)}
                    accept="application/pdf"
                    label="Upload"
                    folder="pdfs"
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
                  <IssueFileUpload
                    onUploadComplete={(url) => form.setValue('cover_image_url', url)}
                    accept="image/*"
                    label="Upload"
                    folder="covers"
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
