import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { issueFormSchema, IssueFormValues } from '@/schemas/issue-form-schema';
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload';

interface IssueFormProps {
  defaultValues: IssueFormValues;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues,
  });

  // Update form when defaultValues change
  useEffect(() => {
    console.log('Updating form with new defaults:', defaultValues);
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Issue Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da edição" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Descrição da edição" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações da Revisão */}
        <div>
          <h3 className="text-lg font-medium mb-4">Informações da Revisão</h3>
          <p className="text-sm text-muted-foreground mb-4">Metadados e informações básicas da revisão</p>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="edition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: [tag:Edição #015] ou Edição #015" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Número ou identificação da edição que será exibida aos usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Metadados de Backend)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add tags as [tag:name]..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Tags para indexação e recomendações - não exibidas aos usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Search Engine Optimization Fields */}
        <div>
          <h3 className="text-lg font-medium mb-4">Search Engine ID</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autores</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome dos autores, separados por vírgula" {...field} />
                  </FormControl>
                  <FormDescription>
                    Será exibido nos resultados de busca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="search_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título para busca</FormLabel>
                  <FormControl>
                    <Input placeholder="Título curto e direto para resultados de busca" {...field} />
                  </FormControl>
                  <FormDescription>
                    Título breve para exibição nos resultados de busca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="search_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição para busca</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição resumida para resultados de busca" rows={2} {...field} />
                  </FormControl>
                  <FormDescription>
                    Será exibido nos resultados de busca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="real_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título real (para busca)</FormLabel>
                    <FormControl>
                      <Input placeholder="Título completo original" {...field} />
                    </FormControl>
                    <FormDescription>
                      Para indexação no mecanismo de busca
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="real_title_ptbr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título real PT-BR (para busca)</FormLabel>
                    <FormControl>
                      <Input placeholder="Título completo em português" {...field} />
                    </FormControl>
                    <FormDescription>
                      Para indexação no mecanismo de busca
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de publicação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="design"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design do estudo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ensaio Clínico Randomizado, Coorte, etc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormDescription>
                      Usado para ordenação por popularidade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="population"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>População</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Adultos, Pediátrico, Idosos, Gestantes" {...field} />
                  </FormControl>
                  <FormDescription>
                    Categoria da população do estudo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* File Upload Fields */}
        <div>
          <h3 className="text-lg font-medium mb-4">Arquivos</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="pdf_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review PDF URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="PDF URL" {...field} />
                      <SimpleFileUpload
                        onUploadComplete={(url) => form.setValue('pdf_url', url)}
                        accept="application/pdf"
                        label="Upload"
                        bucket="issues"
                        folder="pdfs"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="article_pdf_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Article PDF URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Original article PDF URL" {...field} />
                      <SimpleFileUpload
                        onUploadComplete={(url) => form.setValue('article_pdf_url', url)}
                        accept="application/pdf"
                        label="Upload"
                        bucket="issues"
                        folder="pdfs"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Cover image URL" {...field} />
                      <SimpleFileUpload
                        onUploadComplete={(url) => form.setValue('cover_image_url', url)}
                        accept="image/*"
                        label="Upload"
                        bucket="issues"
                        folder="covers"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
