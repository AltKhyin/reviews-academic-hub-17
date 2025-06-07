import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormIssueValues } from '@/types/issue';
import { UseFormReturn } from 'react-hook-form';
import { IssuePDFUpload } from '@/components/issue/IssuePDFUpload';
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload';
import { Loader2 } from 'lucide-react';

interface IssueFormProps {
  form: UseFormReturn<FormIssueValues>;
  onSubmit: (values: FormIssueValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({ form, onSubmit, onCancel, isSubmitting = false }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="[tag:hematologia][tag:medicina]" 
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

        <FormField
          control={form.control}
          name="article_pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artigo Original PDF</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="URL do arquivo PDF original" {...field} />
                  <IssuePDFUpload
                    onUploadComplete={(url) => form.setValue('article_pdf_url', url)}
                    label="Upload"
                    folder="pdfs"
                    useProcessingBucket={true}
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
                  <IssuePDFUpload
                    onUploadComplete={(url) => form.setValue('pdf_url', url)}
                    label="Upload"
                    folder="pdfs"
                    useProcessingBucket={true}
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
                  <SimpleFileUpload
                    onUploadComplete={(url) => form.setValue('cover_image_url', url)}
                    accept="image/*"
                    label="Upload"
                    bucket="issues"
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
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
